"use strict";

const jp = require("..");
const prettier = require("prettier");

//const path = "$..id";
//const path = "$.foo[3].bar[1]";
const path = "$.foo[($.idx)]";

const code = jp.compiler.compile(
  [
    ...jp.parse(path),
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
