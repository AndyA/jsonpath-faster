"use strict";

const util = require("util");
const jp = require("jsonpath");
const prettier = require("prettier");

const inspect = obj =>
  util.inspect(obj, {
    depth: null,
    sorted: true,
    getters: true
  });

const json = obj => JSON.stringify(obj, null, 2);

const makeTokenMatcher = t => {
  if (typeof t === "function") return t;

  const match = (obj, test) => {
    if (Array.isArray(test)) return test.some(t => match(obj, t));
    if (typeof obj === "string") return test === obj;
    for (const prop in test) if (!match(obj[prop], test[prop])) return false;
    return true;
  };

  return tok => match(tok, t);
};

const identifiers = {
  root: makeTokenMatcher({ expression: { type: "root", value: "$" } }),
  childMember: makeTokenMatcher({
    expression: { type: "identifier" },
    scope: "child",
    operation: "member"
  })
};

const js = expr => JSON.stringify(expr);

const compiler = [
  {
    when: { expression: { type: "root", value: "$" } },
    gen: (ctx, tok) => ctx.chain()
  },
  {
    when: {
      expression: { type: "identifier" },
      scope: "child",
      operation: "member"
    },
    gen: (ctx, tok) =>
      ctx.code(
        `if (${js(tok.expression.value)} in ${ctx.lvar}) { ${ctx.chain(
          "." + tok.expression.value
        )} }`
      )
  },
  {
    when: {
      expression: { type: "wildcard", value: "*" },
      scope: "child",
      operation: ["member", "subscript"]
    },
    gen: (ctx, tok) => {
      const i = ctx.sym("i");
      return ctx
        .scope()
        .use("iterateAll")
        .code(`iterateAll(${ctx.lvar}, ${i} => { ${ctx.chain(`[${i}]`)} });`);
    }
  },
  {
    when: {},
    gen: (ctx, tok) => {
      console.log(`Unknown token: ${inspect(tok)}`);
    }
  }
].map(({ when, gen }) => ({
  when: makeTokenMatcher(when),
  gen
}));

const lib = {
  iterateAll: [
    `const iterateAll = (obj, cb) => {`,
    `  if (Array.isArray(obj)) for (const i of obj) cb(i);`,
    `  else for (const i in obj) cb(i);`,
    `};`
  ]
};

// How to handle the need to collect paths for jp.nodes()?
// flag in ctx?
// inject additional ops into the ast?

const compile = (compiler, lib, ast, ctx, lastly) => {
  const despatch = (ast, ctx) => {
    const [tok, ...tail] = ast;

    const next = ctx => {
      if (tail.length) return despatch(tail, ctx);
      return lastly(ctx);
    };

    for (const h of compiler)
      if (h.when(tok)) return h.gen({ ...ctx, next, prepend: [] }, tok);
    throw new Error(`Unhandled token`);
  };

  const ns = {};
  const reqs = new Set();
  const prepend = [];

  const context = {
    lvar: "obj",
    prepend: [],

    sym(pfx) {
      return `${pfx}${(ns[pfx] = (ns[pfx] || 0) + 1)}`;
    },

    code(...lines) {
      return [...this.prepend, ...lines].join("\n");
    },

    use(req) {
      if (!lib[req]) throw new Error(`No ${req} in library`);
      if (!reqs.has(req)) {
        prepend.push(lib[req].join("\n"));
        reqs.add(req);
      }
      return this;
    },

    scope() {
      const v = this.sym("v");
      this.prepend.push(`const ${v} = ${this.lvar};`);
      this.lvar = v;
      return this;
    },

    chain(lvx) {
      if (lvx) return this.next({ ...this, lvar: this.lvar + lvx });
      return this.next(this);
    },

    ...ctx
  };

  const code = despatch(ast, context);

  return [...prepend, code].join("\n");
};

//const path = "$.foo.bar[*]..id";
const path = "$.foo.bar[*].id[*]";
const ast = jp.parse(path);
const code = compile(compiler, lib, ast, {}, ctx => {
  console.log(`Lastly ${inspect(ctx)}`);
  return `cb(${ctx.lvar});`;
});
//console.log(code);
const pretty = prettier.format(code, { filepath: "code.js" });
console.log(pretty);
//console.log(inspect(ast));

//for (const tok of ast) {
//  console.log(JSON.stringify(tok));
//  for (const test in identifiers) {
//    if (identifiers[test](tok)) console.log(`  ${test}`);
//  }
//}
