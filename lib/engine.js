"use strict";

const Compiler = require("./compiler");
const { undefer, json, js, lv, isObject, inspect } = require("./util");
const { parseSlice, renderSlice } = require("./slice");

const bindScript = (expr, lval) => expr.replace(/@/g, lval);

const bindFilter = (expr, lval) => {
  const m = expr.match(/^\?\((.*)\)$/);
  if (!m) throw new Error(`Can't parse filter ${expr}`);
  return bindScript(m[1], lval);
};

const selectorCompiler = [
  {
    when: {
      expression: { type: ["identifier", "string_literal", "numeric_literal"] },
      operation: ["member", "subscript"]
    },
    gen: (ctx, tok) => {
      const i = js(tok.expression.value);
      return {
        code: (lval, block) =>
          `if (${lv(lval, i)} !== undefined) ${undefer(block, i)};`
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
        array: renderSlice(ctx, 0, "", 1),
        object: (lval, block) =>
          `for (const ${i} in ${lval}) ${undefer(block, i)};`
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
            `const ${i} = ${bindScript(tok.expression.value, lval)};`,
            `if (${lval}[${i}] !== undefined) ${undefer(block, i)};`
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
      for (const key of ["array", "object"])
        out[key] = (lval, block) =>
          all[key](
            lval,
            i =>
              `if (${bindFilter(value, `${lval}[${i}]`)}) ${undefer(block, i)};`
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

const structureCompiler = [
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
        .addFunction(
          `(o, cb) => {` +
            `  if (Array.isArray(o)) {` +
            `    ${sel.array("o", i => `cb(o, ${i})`)}` +
            `  } else if (isObject(o)) {` +
            `    ${sel.object("o", i => `cb(o, ${i})`)}` +
            `  }` +
            `}`
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

      const expand = key =>
        sel[key]("o", i => `cb(o, ${i}, ...path, ${i})`) +
        all[key]("o", i => `self(o[${i}], cb, self, ...path, ${i})`);

      const f = ctx
        .use("isObject")
        .addFunction(
          `(o, cb, self, ...path) => {` +
            `  if (Array.isArray(o)) { ${expand("array")} }` +
            `  else if (isObject(o)) { ${expand("object")} }` +
            `}`
        );

      return ctx.code(`${f}(${ctx.lval}, (o, i, ...part) => ${next}, ${f})`);
    }
  },
  {
    when: {},
    gen: (ctx, tok) => {
      console.log(`structureCompiler: Unknown token: ${inspect(tok)}`);
      return ctx.chain(js("!"));
    }
  }
];

const lib = {
  isObject: {
    code: [`const isObject = o => o === Object(o);`]
  }
};

module.exports = new Compiler(structureCompiler, selectorCompiler, lib);
