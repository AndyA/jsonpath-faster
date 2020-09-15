"use strict";

const inspect = require("../lib/inspect");
const jp = require("..");
const prettier = require("prettier");

jp.compiler.on("compile", ({ code, ast }) => {
  const prog = `const ast = ${JSON.stringify(ast)}; ${code}`;
  const pretty = prettier.format(prog, { filepath: "prog.js" });
  console.log(pretty);
});

const nest = jp.string
  .nest()
  .visitor("$", (value, path) => console.log(`v1 ${value}`))
  .visitor("$", (value, path) => console.log(`v2 ${value}`))
  .visitor("$", (value, path) => console.log(`v3 ${value}`));

const doc = { id: 1 };
nest(doc);
