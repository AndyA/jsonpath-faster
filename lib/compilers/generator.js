"use strict";

const { js, lv, isObject, inspect } = require("../util");

module.exports = [
  {
    when: { scope: "child" },
    gen: (ctx, tok) => {
      const sel = ctx.selector(tok);

      if (sel.code)
        return ctx.code(sel.code(ctx.lval, i => ctx.block(i, `[${i}]`)));

      const [o, i] = ctx.sym("o", "i");
      const next = ctx.block(i, [lv(o, i)]);

      const f = ctx
        .use("isObject")
        .addFunction(
          `function* (o) {` +
            `  if (Array.isArray(o)) {` +
            `    ${sel.array("o", i => `yield [o, ${i}]`)}` +
            `  } else if (isObject(o)) {` +
            `    ${sel.object("o", i => `yield [o, ${i}]`)}` +
            `  }` +
            `}`
        );

      return ctx.code(`for (const [${o}, ${i}] of ${f}(${ctx.lval})) ${next}`);
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

      const [o, i] = ctx.sym("o", "i");
      const next = ctx.block("part", [lv(o, i)]);

      const expand = key =>
        sel[key]("o", i => `yield [o, ${i}, ...path, ${i}]`) +
        all[key]("o", i => `yield *self(o[${i}], self, ...path, ${i})`);

      const f = ctx
        .use("isObject")
        .addFunction(
          `function* (o, self, ...path) {` +
            `  if (Array.isArray(o)) { ${expand("array")} }` +
            `  else if (isObject(o)) { ${expand("object")} }` +
            `}`
        );

      return ctx.code(
        `for (const [${o}, ${i}, ...part] of ${f}(${ctx.lval}, ${f}))`,
        `  ${next}`
      );
    }
  },

  ...require("./callback")
];
