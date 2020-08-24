"use strict";

const prettier = require("prettier");
const { makeTree, mergeTrees, renderTree } = require("../lib/merge");
const { inspect } = require("../lib/util");
const jp = require("..");

const exprs = ["$.foo.bar", "$.foo.baz[0]", "$.foo.baz[1]", "$.foo..id"];

const makeOp = expr => [
  ...jp.parse(expr),
  {
    scope: "internal",
    operation: "terminal",
    lastly: ctx => `console.log(${JSON.stringify(expr)}, path);`
  }
];

const out = [];
for (const expr of exprs) {
  mergeTrees(out, makeTree(makeOp(expr)));
}
//console.log(inspect(out));

const ast = renderTree(out);
const code = jp.compiler.compileTokens(ast, { trackPath: true });
//console.log(code);
const pretty = prettier.format(code, { filepath: "code.js" });
console.log(pretty);
