"use strict";

const { parseSlice, renderSlice } = require("../slicer");
const { js, lv } = require("../util");
const { bindScript, bindFilter } = require("../scripts");

module.exports = [
  {
    when: {
      expression: { type: ["identifier", "string_literal", "numeric_literal"] },
      operation: ["member", "subscript"]
    },
    gen: (ctx, tok) => {
      const i = js(tok.expression.value);
      return {
        code: (lval, block) => {
          const val = lv(lval, i);
          const next = block(i);
          if (tok.vv) {
            if (tok.vv === true) return next;
            return `if (${val} == undefined) { ${val} = ${tok.vv} }; ${next}`;
          }
          return `if (${val} != undefined) ${next};`;
        }
      };
    }
  },
  {
    when: {
      expression: { type: "wildcard", value: "*" },
      operation: ["member", "subscript"]
    },
    gen: (ctx, tok) => {
      const [i] = ctx.sym("i");
      return {
        array: renderSlice(ctx),
        object: (lval, block) => `for (var ${i} in ${lval}) ${block(i)};`
      };
    }
  },
  {
    when: {
      expression: { type: "union" }
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
    }
  },
  {
    when: { expression: { type: "slice" }, operation: "subscript" },
    gen: (ctx, tok) => {
      const [start, end, step] = parseSlice(tok.expression.value);
      return {
        array: renderSlice(ctx, start, end, step),
        object: (lval, block) => ""
      };
    }
  },
  {
    when: { expression: { type: "script_expression" }, operation: "subscript" },
    gen: (ctx, tok) => {
      return {
        code: (lval, block) => {
          const [i] = ctx.sym("i");
          return [
            `var ${i} = ${bindScript(tok.expression.value, lval)};`,
            `if (${lval}[${i}] != undefined) ${block(i)};`
          ].join("\n");
        }
      };
    }
  },
  {
    when: { expression: { type: "filter_expression" }, operation: "subscript" },
    gen: (ctx, tok) => {
      const all = ctx.selector({
        expression: { type: "wildcard", value: "*" },
        operation: "member"
      });

      const out = {};
      const { value } = tok.expression;
      // TODO code only?
      for (const key of ["array", "object"])
        out[key] = (lval, block) =>
          all[key](
            lval,
            i => `if (${bindFilter(value, `${lval}[${i}]`)}) ${block(i)};`
          );
      return out;
    }
  },
  {
    when: {},
    gen: (ctx, tok) => {
      console.log(`selectorCompiler: Unknown token: ${inspect(tok)}`);
      return { code: i => "" };
    }
  }
];
