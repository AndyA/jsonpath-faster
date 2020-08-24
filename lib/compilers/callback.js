"use strict";

const { js, lv, isObject, inspect } = require("../util");

module.exports = [
  {
    when: { expression: { type: "root", value: "$" } },
    gen: (ctx, tok) => ctx.chain(js("$"))
  },
  {
    when: { scope: "child" },
    gen: (ctx, tok) => {
      const sel = ctx.selector(tok);

      if (sel.code)
        return ctx.code(sel.code(ctx.lval(), i => ctx.block(i, { i })));

      const next = ctx.block("i", { o: "o", i: "i" });

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

      const next = ctx.block(null, { o: "o", i: "i" });

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
      // TODO const?
      if (ctx.trackPath) frag = `const path = stack.slice(0); ${frag}`;
      if (ctx.counted) frag = `if (count-- <= 0) return; ${frag}`;
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
      return tok.next.map(n => ctx.despatch(n)).join("\n");
    }
  }
];
