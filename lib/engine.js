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

const parseSlice = slice => {
  const parts = slice.split(":");

  const norm = (...parts) => {
    if (parts.length < 2) return norm(0, ...parts);
    if (parts.length < 3) return norm(...parts, 1);
    if (parts.length > 3)
      throw new Error(`Too many components in slice: ${slice}`);
    return parts;
  };

  return norm(...parts).map((v, i) => {
    if (v === "") {
      switch (i) {
        case 0:
          return 0;
        case 1:
          return "";
        case 2:
          return 1;
      }
    }
    if (isNaN(v)) throw new Error(`Non-numeric element in slice ${slice}`);
    return Number(v);
  });
};

const renderSlice = (ctx, start, end, step) => {
  return (lval, block) => {
    if (step <= 0) throw new Error(`Non positive step ${step}`);
    const code = [];

    if (start < 0) {
      const [s] = ctx.sym("s");
      code.push(`const ${s} = Math.max(0, ${lval}.length${start});`);
      start = s;
    }

    if (end === "") {
      end = `${lval}.length`;
    } else {
      const [e] = ctx.sym("e");
      if (end < 0) code.push(`const ${e} = ${lval}.length${end};`);
      else code.push(`const ${e} = Math.min(${end}, ${lval}.length);`);
      end = e;
    }

    const [i] = ctx.sym("i");
    return [
      ...code,
      `for (let ${i} = ${start}; ${i} < ${end}; ${i} += ${step}) ${undefer(
        block,
        i
      )};`
    ].join("\n");
  };
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
      return { code: i => "" };
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
