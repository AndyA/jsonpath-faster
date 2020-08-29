"use strict";

const { bindFactory, bindLastly } = require("../lastly");
const { mergeOr } = require("../util");

const ro = (name, lhs) => {
  if (lhs) throw new Error(`${name} is read-only`);
};

const terminal = (ctx, tok) => {
  let frag = tok.lastly(ctx);

  const factory = bindFactory(ctx);
  const context = {
    // Non-vivifying value
    nvalue(lhs) {
      return { code: ctx.lval() };
    },

    value(lhs) {
      if (lhs) ctx.opt.vivify = true;
      return this.nvalue(lhs);
    },

    parent(lhs) {
      return { code: ctx.plval };
    },

    pathArray(lhs) {
      ro("pathArray", lhs);
      ctx.opt.trackPath = true;
      return factory("path", v => `var ${v} = stack.slice(0);`);
    },

    pathString(lhs) {
      ro("pathString", lhs);
      ctx.use("stringify");
      return factory("pathString", v => `var ${v} = stringify(@.pathArray)`);
    },

    path(lhs) {
      ro("path", lhs);
      return tok.pragmas.string ? this.pathString(lhs) : this.pathArray(lhs);
    }
  };

  let { pre, post, code } = bindLastly(frag, context);

  if (ctx.opt.order) {
    const group = tok.group !== undefined ? tok.group : ctx.groups.length;
    ctx.groups.push([]);
    code = `groups[${group}].push(() => { ${code} });`;
  }

  frag = [pre, code, post].join("\n");

  if (tok.pragmas.leaf) {
    // leaf & interior are mutually exclusive
    if (tok.pragmas.interior) return `void 0;`;
    frag = `if (!isObject(${ctx.use("isObject").lval()})) { ${frag} }`;
  }
  if (tok.pragmas.interior)
    frag = `if (isObject(${ctx.use("isObject").lval()})) { ${frag} }`;

  return frag;
};

// Synthetic token types not emitted by jp.parse()
module.exports = [
  // terminal: last operation in the chain
  {
    when: {
      operation: "terminal",
      scope: "internal"
    },
    gen: (ctx, tok) => {
      let frag = terminal(ctx, tok);

      if (ctx.opt.counted) frag = `if (count-- <= 0) return; ${frag}`;
      return frag;
    }
  },
  // fork: branch into multiple operations
  {
    when: {
      operation: "fork",
      scope: "internal"
    },
    gen: (ctx, tok) => {
      const out = [];
      const nopt = { ...ctx.opt };
      for (const next of tok.next) {
        // Turn on ordering
        const nctx = {
          ...ctx,
          opt: { ...ctx.opt, order: !tok.pragmas.unordered }
        };
        out.push(nctx.despatch(next));
        mergeOr(nopt, nctx.opt);
      }
      mergeOr(ctx.opt, nopt);
      return out.join("\n");
    }
  }
];