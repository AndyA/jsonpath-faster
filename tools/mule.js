"use strict";

const prettier = require("prettier");

const jp = require("..");
const inspect = require("../lib/inspect");
const { MultiPath } = require("../lib/multipath");
const { obj } = require("../benchmark/spec");

const paths = ["$.store", "$.store.bicycle"];

const mp = new MultiPath();

for (const expr of paths)
  mp.addVisitor(expr, (value, path) => {
    console.log(`${expr}, ${jp.stringify(path)}: ${value}`);
  });

if (1) {
  const code = mp.code();
  const pretty = prettier.format(`module.exports = ${code}`, {
    filepath: "code.js"
  });
  console.log(pretty);
}

//const fun = mp.compile();
//fun(obj);
