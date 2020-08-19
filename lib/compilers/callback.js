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
        return ctx.code(sel.code(ctx.lval, i => ctx.block(i, `[${i}]`)));

      const next = ctx.block("i", [lv("o", "i")]);

      const f = ctx
        .use("isObject")
        .defineFunction(
          "o, cb",
          `if (Array.isArray(o)) { ${sel.array("o", i => `cb(o, ${i})`)} }` +
            `else if (isObject(o)) { ${sel.object("o", i => `cb(o, ${i})`)} }`
        );

      return ctx.code(`${f}(${ctx.lval}, (o, i) => ${next})`);
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
      const next = ctx.block("part", [lv("o", "i")]);

      // TODO merge these two branches more sensibly.
      if (ctx.trackPath) {
        const expand = key =>
          sel[key]("o", i => `cb(o, ${i}, ...path, ${i})`) +
          all[key]("o", i => `self(o[${i}], cb, self, ...path, ${i})`);

        const f = ctx
          .use("isObject")
          .defineFunction(
            "o, cb, self, ...path",
            `if (Array.isArray(o)) { ${expand("array")} }` +
              `else if (isObject(o)) { ${expand("object")} }`
          );

        return ctx.code(`${f}(${ctx.lval}, (o, i, ...part) => ${next}, ${f})`);
      } else {
        const expand = key =>
          sel[key]("o", i => `cb(o, ${i})`) +
          all[key]("o", i => `self(o[${i}], cb, self)`);

        const f = ctx
          .use("isObject")
          .defineFunction(
            "o, cb, self",
            `if (Array.isArray(o)) { ${expand("array")} }` +
              `else if (isObject(o)) { ${expand("object")} }`
          );

        return ctx.code(`${f}(${ctx.lval}, (o, i) => ${next}, ${f})`);
      }
    }
  },
  {
    when: {},
    gen: (ctx, tok) => {
      console.log(`callbackCompiler: Unknown token: ${inspect(tok)}`);
      return ctx.chain(js("!"));
    }
  }
];
