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
    gen: (ctx, tok) => ctx.chain(js("$"))
  },
  {
    when: {
      expression: { type: "identifier" },
      scope: "child",
      operation: "member"
    },
    gen: (ctx, tok) => {
      const i = js(tok.expression.value);
      return ctx.code(
        `if (${ctx.lval}[${i}] !== undefined) ${ctx.block(
          i,
          "." + tok.expression.value
        )}`
      );
    }
  },
  {
    // $.foo[*] / $.foo.*
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
        .code(`iterateAll(${ctx.lval}, ${i} => ${ctx.block(i, `[${i}]`)});`);
    }
  },
  {
    // $..*
    when: {
      expression: { type: "wildcard", value: "*" },
      scope: "descendant",
      operation: "member"
    },
    gen: (ctx, tok) => {
      const i = ctx.sym("i");
      const o = ctx.sym("o");
      const p = ctx.sym("p");
      return ctx
        .use("search")
        .code(
          `search(${ctx.lval}, (${o}, ${i}, ...${p}) => ${ctx.block(p, [
            `${o}[${i}]`
          ])});`
        );
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

const search = (obj, cb, ...path) => {
  if (Array.isArray(obj))
    for (let i = 0; i < obj.length; i++) {
      cb(obj, i, ...path, i);
      search(obj[i], cb, ...path, i);
    }
  else if (isObject(obj))
    for (const i in obj) {
      cb(obj, i, ...path, i);
      search(obj[i], cb, ...path, i);
    }
};

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
  },
  search: {
    use: ["isObject"],
    code: [`const search = ${search.toString()};`]
  }
};

// How to handle the need to collect paths for jp.nodes()?
// flag in ctx?
// inject additional ops into the ast?

const compile = (compiler, lib, path, ctx, lastly, trackPath = true) => {
  const ast = jp.parse(path);
  const despatch = (ast, ctx, lastly) => {
    const [tok, ...tail] = ast;

    const next = ctx => {
      if (tail.length) return despatch(tail, ctx, lastly);
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

    chainNext(lvx) {
      if (lvx) {
        if (Array.isArray(lvx)) return this.next({ ...this, lval: lvx[0] });
        return this.next({ ...this, lval: this.lval + lvx });
      }
      return this.next(this);
    },

    chain(part, lvx) {
      const n = this.chainNext(lvx);
      if (!trackPath) return n;
      return `stack.push(${part}); ${n}; stack.pop();`;
    },

    block(part, lvx) {
      return `{ ${this.chain(part, lvx)} }`;
    },

    ...ctx
  };

  const leaf = (lastly => {
    if (trackPath) {
      prepend.push(`const stack = []`);
      return ctx => `const path = stack.flat(); ${lastly(ctx)}`;
    }
    return lastly;
  })(lastly);

  const code = despatch(ast, context, leaf);

  return [...prepend, `// ${path} on ${context.lval}`, code].join("\n");
};

const func = code => {
  const gen = genfun();
  gen(`(obj, cb) => { ${code} }`);
  return gen.toFunction({});
};

const paths = [
  "$..*"
  //"$.foo.bar[*].id[*]", "$.foo..*", "$.foo..*.id.*"
];

for (const path of paths) {
  console.log(`*** ${path}`);
  const code = compile(
    compiler,
    lib,
    path,
    {},
    ctx => `cb(${ctx.lval}, path);`
  );
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
  console.log(`\njsonpath: ${path}`);
  for (const { path: p, value } of jp.nodes(obj, path))
    console.log(jp.stringify(p), value);

  console.log(`\njsonpath-faster: ${path}`);
  f(obj, (value, p) => {
    console.log(jp.stringify(p), value);
  });
}
