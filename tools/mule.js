"use strict";

const prettier = require("prettier");

const jp = require("..");
const { inspect } = require("../lib/util");
const { MultiPath } = require("../lib/multipath");

const exprs = ["$.foo.bar", "$.foo.baz[0]", "$.foo.baz[1]", "$.foo..id"];

const mp = new MultiPath();

for (const expr of exprs)
  mp.addAction(expr, ctx => `console.log(${JSON.stringify(expr)}, path);`);

const code = jp.compiler.compileTokens(mp.render(), { trackPath: true });

const pretty = prettier.format(code, { filepath: "code.js" });
console.log(pretty);
