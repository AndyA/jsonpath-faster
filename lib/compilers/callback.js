"use strict";

const { js, lv } = require("../util");

module.exports = [
  {
    when: { expression: { type: "root", value: "$" } },
    gen: (ctx, tok) => {
      const next = ctx.chain(js("$"));
      if (ctx.opt.vivify && tok.vivify && tok.vv)
        return `if (${ctx.lval()} === undefined) ${ctx.lval()} = ${
          tok.vv
        }; ${next}`;
      return next;
    }
  },
  {
    when: { scope: "child" },
    gen: (ctx, tok) => {
      const sel = ctx.selector(tok);

      if (sel.code)
        return ctx.code(sel.code(ctx.lval(), i => ctx.chain(i, { i })));

      const next = ctx.chain("i", { o: "o", i: "i" });

      const f = ctx
        .use("isObject")
        .defineFunction(
          "o, cb",
          `if (Array.isArray(o)) { ${sel.array("o", i => `cb(o, ${i})`)} }` +
            `else if (isObject(o)) { ${sel.object("o", i => `cb(o, ${i})`)} }`
        );

      return ctx.code(`${f}(${ctx.lval()}, function(o, i) { ${next} })`);
    }
  },
  {
    when: { scope: "descendant" },
    gen: (ctx, tok) => {
      const sel = ctx.selector(tok);
      const all = ctx.selector({
        expression: { type: "wildcard", value: "*" },
        operation: "member"
      });

      const next = ctx.chain(null, { o: "o", i: "i" });

      const expand = key =>
        sel[key]("o", i => `{ ${ctx.tracker(i, `cb(o, ${i});`)} }`) +
        all[key]("o", i => `{ ${ctx.tracker(i, `self(o[${i}], cb, self);`)} }`);

      const f = ctx
        .use("isObject")
        .defineFunction(
          "o, cb, self",
          `if (Array.isArray(o)) { ${expand("array")} }` +
            `else if (isObject(o)) { ${expand("object")} }`
        );

      return ctx.code(`${f}(${ctx.lval()}, function(o, i) { ${next} }, ${f})`);
    }
  },
  // Synthetic token types not emitted by jp.parse()
  // terminal: last operation in the chain
  {
    when: {
      operation: "terminal",
      scope: "internal"
    },
    gen: (ctx, tok) => {
      let frag = tok.lastly(ctx);

      // TEMP get bindLastly involved
      const { bindLastly } = require("../lastly");
      const context = {
        value: () => ctx.lval(),
        parent: () => ctx.plval,
        path: () => {
          ctx.opt.trackPath = true;
          return "path";
        }
        //        path: () => "stack.slice(0)"
        //        pathString: () => "jp.stringify(@.path)"
      };

      frag = bindLastly(frag, context);

      // TODO const?
      if (ctx.opt.trackPath) frag = `const path = stack.slice(0); ${frag}`;
      if (ctx.opt.counted) frag = `if (count-- <= 0) return; ${frag}`;
      // TODO to localise path
      return `{ ${frag}; }`;
    }
  },
  // fork: branch into multiple operations
  {
    when: {
      operation: "fork",
      scope: "internal"
    },
    gen: (ctx, tok) => {
      return tok.next.map(n => ctx.despatch(n)).join("\n");
    }
  }
];
