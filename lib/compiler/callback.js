"use strict";

const { js, lv } = require("../util");

const internal = require("./internal");

const descender = (ctx, expand) => {
  const next = ctx.chain(null, { o: "o", i: "i" });
  const f = ctx
    .use("isObject")
    .defineFunction(
      "o, cb, self",
      `if (Array.isArray(o)) { ${expand("array")} }` +
        `else if (isObject(o)) { ${expand("object")} }`
    );

  return ctx.code(`${f}(${ctx.lval()}, function(o, i) { ${next} }, ${f})`);
};

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
    when: {
      expression: { type: "wildcard", value: "*" },
      scope: "descendant",
      operation: "member",
      pragmas: { unordered: true }
    },
    gen: (ctx, tok) => {
      const sel = ctx.selector(tok);
      const expand = key =>
        sel[key](
          "o",
          i => `{ ${ctx.tracker(i, `cb(o, ${i}); self(o[${i}], cb, self);`)} }`
        );

      return descender(ctx, expand);
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

      const expand = key =>
        sel[key]("o", i => `{ ${ctx.tracker(i, `cb(o, ${i});`)} }`) +
        all[key]("o", i => `{ ${ctx.tracker(i, `self(o[${i}], cb, self);`)} }`);

      return descender(ctx, expand);
    }
  },
  ...internal
];
