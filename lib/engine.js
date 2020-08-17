"use strict";

const Compiler = require("../lib/compiler");

const json = obj => JSON.stringify(obj, null, 2);
const js = expr => JSON.stringify(expr);
const lv = (lval, i) => `${lval}[${i}]`;

const isObject = o => o === Object(o);

// the selector can be
//    a literal object key
//    a literal array index
//    an array slice
//    a function that yields a key / index
//    a filter function
//    a wildcard

const selectorCompiler = [
  {
    when: {
      expression: { type: ["identifier", "string_literal", "numeric_literal"] },
      operation: ["member", "subscript"]
    },
    gen: (ctx, tok) => {
      const i = js(tok.expression.value);
      return {
        i,
        code: (lval, idx, block) =>
          `if (${lv(lval, idx)} !== undefined) ${block}`
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
        i,
        array: (lval, idx, block) =>
          `for (let ${idx} = 0; ${idx} < ${lval}.length; ${idx}++) ${block}`,
        object: (lval, idx, block) => `for (const ${idx} in ${lval}) ${block}`
      };
    }
  },
  {
    when: {},
    gen: (ctx, tok) => {
      console.log(`selectorCompiler: Unknown token: ${inspect(tok)}`);
      return ctx.chain(js("!"));
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

      if (sel.code) {
        const next = ctx.block(sel.i, `[${sel.i}]`);
        return ctx.code(sel.code(ctx.lval, sel.i, next));
      }

      const next = ctx.block("i", [lv("o", "i")]);

      // TODO surely we just use "i" here - not sel.i?
      const f = ctx
        .use("isObject")
        .addFunction(
          `(o, cb) => {` +
            `  if (Array.isArray(o)) {` +
            `    ${sel.array("o", sel.i, `cb(o, ${sel.i})`)};` +
            `  } else if (isObject(o)) {` +
            `    ${sel.object("o", sel.i, `cb(o, ${sel.i})`)}` +
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
        `${sel[key]("o", sel.i, `cb(o, ${sel.i}, ...path, ${sel.i})`)};` +
        `${all[key]("o", "i", `self(o[i], cb, self, ...path, i)`)};`;

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
