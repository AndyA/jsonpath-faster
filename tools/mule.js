"use strict";

const jp = require("..");
const prettier = require("prettier");

const addTerminal = (path, lastly, ctx) =>
  jp.compiler.compile(
    [...jp.parse(path), { operation: "terminal", scope: "internal", lastly }],
    ctx
  );

const code = addTerminal("$.person[(1-1)].name", ctx => `cb(@.value);`, {
  counted: true
});

const pretty = prettier.format(code, { filepath: "code.js" });

console.log(pretty);
