"use strict";

const { js } = require("../util");

const internal = require("./internal");

const descender = (ctx, expand, pathVar) => {
  const next = ctx.chain(pathVar, { o: "o", i: "i" });
  const arrayCode = expand("array");
  const objectCode = expand("object");
  let fun = `if (Array.isArray(o)) { ${arrayCode} }`;
  if (objectCode) fun += `else if (isObject(o)) { ${objectCode} }`;
  const f = ctx.use("isObject").defineFunction("o, cb, self", fun);

  return ctx.code(`${f}(${ctx.lval()}, function(o, i) { ${next} }, ${f})`);
};

module.exports = [
  {
    when: { expression: { type: "root", value: "$" } },
    gen: (ctx, tok) => {
      const next = ctx.chain(js("$"));
      if (ctx.opt.vivify && tok.vivify && tok.vv) {
        const lv = ctx.lval();
        return `if (${lv} === undefined) ${lv} = ${tok.vv}; ${next}`;
      }
      return next;
    }
  },
  {
    when: { scope: "child" },
    gen: (ctx, tok) => {
      const sel = ctx.selector(tok);

      if (sel.code)
        return ctx.code(sel.code(ctx.lval(), i => ctx.chain(i, { i })));

      const expand = key => sel[key]("o", i => `cb(o, ${i});`);

      return descender(ctx, expand, "i");
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

      return descender(ctx, expand, null);
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

      return descender(ctx, expand, null);
    }
  },
  ...internal
];
