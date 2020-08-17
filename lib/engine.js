"use strict";

const util = require("util");
const Compiler = require("../lib/compiler");

const json = obj => JSON.stringify(obj, null, 2);
const js = expr => JSON.stringify(expr);
const lv = (lval, i) => `${lval}[${i}]`;
const undefer = (v, ...args) => (typeof v === "function" ? v(...args) : v);

const isObject = o => o === Object(o);

const inspect = obj =>
  util.inspect(obj, {
    depth: null,
    sorted: true,
    getters: true
  });

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
        code: (lval, block) =>
          `if (${lv(lval, i)} !== undefined) ${undefer(block, i)}`
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
        array: (lval, block) =>
          `for (let ${i} = 0; ${i} < ${lval}.length; ${i}++) ` +
          undefer(block, i),
        object: (lval, block) =>
          `for (const ${i} in ${lval}) ` + undefer(block, i)
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
        return ctx.code(sel.code(ctx.lval, next));
      }

      const next = ctx.block("i", [lv("o", "i")]);

      const f = ctx
        .use("isObject")
        .addFunction(
          `(o, cb) => {` +
            `  if (Array.isArray(o)) {` +
            `    ${sel.array("o", i => `cb(o, ${i})`)};` +
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
        `${sel[key]("o", i => `cb(o, ${i}, ...path, ${i})`)};` +
        `${all[key](
          "o",
          i => `self(o[${i}], cb, self, ...path, ${i})`
        )};`;

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
