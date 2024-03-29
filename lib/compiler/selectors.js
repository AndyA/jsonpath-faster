"use strict";

const { parseSlice, renderSlice } = require("../slicer");
const { js, lv } = require("../util");
const { bindScript, bindFilter } = require("../scripts");

const subscript = (ctx, tok) => {
  return (lval, block) => {
    const i = js(tok.expression.value);
    const val = lv(lval, i);
    const next = block(i);
    if (ctx.opt.vivify && tok.vivify) {
      if (tok.vv)
        return `if (${val} === undefined) ${val} = ${tok.vv}; ${next}`;
      return next;
    }
    return `if (${val} !== undefined) { ${next} }`;
  };
};

module.exports = [
  {
    when: {
      expression: { type: "numeric_literal" },
      operation: "subscript",
    },
    gen: (ctx, tok) => ({
      array: subscript(ctx, tok),
      object: (lval, block) => "",
    }),
  },
  {
    when: {
      expression: { type: ["identifier", "string_literal", "numeric_literal"] },
      operation: ["member", "subscript"],
    },
    gen: (ctx, tok) => ({
      code: subscript(ctx, tok),
    }),
  },
  {
    when: {
      expression: { type: "wildcard", value: "*" },
      operation: ["member", "subscript"],
    },
    gen: (ctx, tok) => {
      const [i] = ctx.sym("i");
      return {
        array: renderSlice(ctx),
        object: (lval, block) => `for (var ${i} in ${lval}) { ${block(i)}; }`,
      };
    },
  },
  {
    when: {
      expression: { type: "union" },
    },
    gen: (ctx, tok) => {
      const union = tok.expression.value.map(expression =>
        ctx.selector({ ...tok, ...expression })
      );

      // TODO if they all have code then return code

      const out = {};
      for (const key of ["array", "object"])
        out[key] = (lval, block) =>
          union
            .map(h => h[key])
            .filter(Boolean)
            .map(h => h(lval, block))
            .join("\n");

      return out;
    },
  },
  {
    when: { expression: { type: "slice" }, operation: "subscript" },
    gen: (ctx, tok) => {
      const [start, end, step] = parseSlice(tok.expression.value);
      return {
        array: renderSlice(ctx, start, end, step),
        object: (lval, block) => "",
      };
    },
  },
  {
    when: { expression: { type: "script_expression" }, operation: "subscript" },
    gen: (ctx, tok) => ({
      code: (lval, block) => {
        const [i] = ctx.sym("i");
        const lx = lv(lval, i);

        const code = [];
        const next = block(i);

        code.push(`var ${i} = ${bindScript(tok.expression.value, lval)};`);

        if (ctx.opt.vivify && tok.vivify) {
          // We weren't able to provide an initialisation constant so
          // we have to vivify our own lval here.
          code.push(
            `if (${lval} === undefined) ${lval} = isNaN(${i}) ? {} : [];`
          );
          if (tok.vv) code.push(`if (${lx} === undefined) ${lx} = ${tok.vv};`);
          code.push(next);
        } else {
          code.push(`if (${lx} !== undefined) { ${next} }`);
        }
        return code.join("\n");
      },
    }),
  },
  {
    when: { expression: { type: "filter_expression" }, operation: "subscript" },
    gen: (ctx, tok) => {
      const all = ctx.selector({
        expression: { type: "wildcard", value: "*" },
        operation: "member",
      });

      const out = {};
      const { value } = tok.expression;
      // TODO code only?
      for (const key of ["array", "object"])
        out[key] = (lval, block) =>
          all[key](
            lval,
            i => `if (${bindFilter(value, `${lval}[${i}]`)}) ${block(i)}`
          );
      return out;
    },
  },
];
