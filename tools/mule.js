"use strict";

const jp = require("..");
const prettier = require("prettier");

const addTerminal = (path, lastly, ctx) =>
  jp.compiler.compile(
    [...jp.parse(path), { operation: "terminal", scope: "internal", lastly }],
    ctx
  );

const code = addTerminal("$..*", ctx => `cb(@.leaf);`, {
  counted: true
});

const pretty = prettier.format(code, { filepath: "code.js" });

console.log(pretty);
