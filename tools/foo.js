"use strict";

const jp = require("..");
const prettier = require("prettier");

const code = jp.compiler.compile(
  [
    ...jp.parse("$..id"),
    {
      scope: "internal",
      operation: "terminal",
      lastly: ctx => `${ctx.lval()} = extra;`
    }
  ],
  { vivify: true, counted: true }
);

const pretty = prettier.format(code, { filepath: "code.js" });
console.log(pretty);
