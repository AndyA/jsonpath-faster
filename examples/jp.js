"use strict";

const util = require("util");
const jp = require("jsonpath");
const genfun = require("generate-function");
const prettier = require("prettier");

const Compiler = require("../lib/compiler");

const inspect = obj =>
  util.inspect(obj, {
    depth: null,
    sorted: true,
    getters: true
  });

const json = obj => JSON.stringify(obj, null, 2);
const js = expr => JSON.stringify(expr);

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
      return ctx.code(
        `if (${ctx.lval}[${i}] !== undefined) ${ctx.block(
          i,
          "." + tok.expression.value
        )}`
      );
    }
  },
  {
    when: {
      expression: { type: "wildcard", value: "*" },
      operation: ["member", "subscript"]
    },
    gen: (ctx, tok) => {
      const i = js(tok.expression.value);
      const next = ctx.block(i, `[{${i}}]`);
      return ctx.code({
        i,
        array: [
          `for (let ${i} = 0; ${i} < ${ctx.lval}.length; ${i}++) ${next}`
        ],
        object: [`for (const ${i} in ${ctx.lval}) ${next}`]
      });
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
      // We sometimes need a function wrapper
    }
  },
  {
    when: { scope: "descendant" },
    gen: (ctx, tok) => {
      // We always need a function wrapper
    }
  }
];

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
      const [i] = ctx.sym("i");
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
      const [i, o, p] = ctx.sym("i", "o", "p");
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
      return ctx.chain(js("!"));
    }
  }
];

const search = (obj, cb, ...path) => {
  if (Array.isArray(obj)) {
    // This appears to be how jsonpath does it - presumably because iteration
    // might be constrained.
    for (let i = 0; i < obj.length; i++) cb(obj, i, ...path, i);
    for (let i = 0; i < obj.length; i++) search(obj[i], cb, ...path, i);
  } else if (isObject(obj)) {
    for (const i in obj) cb(obj, i, ...path, i);
    for (const i in obj) search(obj[i], cb, ...path, i);
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

const func = code => {
  const gen = genfun();
  gen(`(obj, cb) => { ${code} }`);
  return gen.toFunction({});
};

const paths = [
  "$..*"
  //  "$.foo.bar[*].id[*]", "$.foo..*", "$.foo..*.id.*",
  //  "$..foo"
];

const c = new Compiler(compiler, lib);

for (const path of paths) {
  console.log(`*** ${path}`);
  const code = c.compile(path, {
    trackPath: true,
    lastly: ctx => `cb(${ctx.lval}, path);`
  });
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
