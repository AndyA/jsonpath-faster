"use strict";

const jp = require("..");
const prettier = require("prettier");

const code = jp.compiler.compile(
  [
    ...jp.parse("$.person[(1-1)].name"),
    {
      scope: "internal",
      operation: "terminal",
      lastly: ctx => ""
    }
  ],
  {
    vivify: true
  }
);

const pretty = prettier.format(code, { filepath: "code.js" });
console.log(pretty);
