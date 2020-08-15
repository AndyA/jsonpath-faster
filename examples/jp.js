"use strict";

const util = require("util");
const jp = require("jsonpath");
const genfun = require("generate-function");
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
        `if (${js(tok.expression.value)} in ${ctx.lval}) ${ctx.block(
          "." + tok.expression.value
        )}`
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
        .frame()
        .use("iterateAll")
        .code(`iterateAll(${ctx.lval}, ${i} => ${ctx.block(`[${i}]`)});`);
    }
  },
  {
    when: {},
    gen: (ctx, tok) => {
      console.log(`Unknown token: ${inspect(tok)}`);
    }
  }
].map(({ when, ...rest }) => ({
  when: makeTokenMatcher(when),
  ...rest
}));

const lib = {
  isObject: {
    code: [`const isObject = o => o === Object(o);`]
  },
  iterateAll: {
    use: ["isObject"],
    code: [
      `const iterateAll = (obj, cb) => {`,
      `  if (Array.isArray(obj)) for (let i = 0; i < obj.length; i++) cb(i);`,
      `  else if (isObject(obj)) for (const i in obj) cb(i);`,
      `};`
    ]
  }
};

const search = (obj, cb, ...path) => {
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {}
  }
};

// How to handle the need to collect paths for jp.nodes()?
// flag in ctx?
// inject additional ops into the ast?

const compile = (compiler, lib, path, ctx, lastly) => {
  const ast = jp.parse(path);
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
    lval: "obj",
    prepend: [],

    sym(pfx) {
      return `${pfx}${(ns[pfx] = (ns[pfx] || 0) + 1)}`;
    },

    code(...lines) {
      return [...this.prepend, ...lines].join("\n");
    },

    use(req) {
      if (reqs.has(req)) return this;
      reqs.add(req);
      const lo = lib[req];
      if (!lo) throw new Error(`No ${req} in library`);
      for (const dep of lo.use || []) this.use(dep);
      prepend.push(`// use ${req}`, lo.code.join("\n"), "\n");
      return this;
    },

    frame() {
      const v = this.sym("v");
      this.prepend.push(`const ${v} = ${this.lval};`);
      this.lval = v;
      return this;
    },

    chain(lvx) {
      if (lvx) return this.next({ ...this, lval: this.lval + lvx });
      return this.next(this);
    },

    block(lvx) {
      return `{ ${this.chain(lvx)} }`;
    },

    ...ctx
  };

  const code = despatch(ast, context);

  return [...prepend, `// ${path} on ${context.lval}`, code].join("\n");
};

const func = code => {
  const gen = genfun();
  gen(`(obj, cb) => { ${code} }`);
  return gen.toFunction({});
};

//const path = "$.foo.bar[*]..id";
const path = "$.foo.bar[*].id[*]";
const code = compile(compiler, lib, path, {}, ctx => `cb(${ctx.lval});`);
//console.log(code);
const pretty = prettier.format(code, { filepath: "code.js" });
console.log(pretty);
const f = func(code);
const obj = {
  baz: {},
  foo: {
    bar: [
      { name: "Pizzo" },
      { id: { name: "Smoo", email: "sam@mrstth.com" } },
      { id: { name: "Andy", email: "andy@hexten.net" } }
    ]
  }
};
f(obj, val => {
  console.log(val);
});
