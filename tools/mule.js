"use strict";

const inspect = require("../lib/inspect");
const jp = require("..");
const prettier = require("prettier");

jp.compiler.on("compile", info => {
  const pretty = prettier.format(info.code, { filepath: "code.js" });
  console.log(pretty);
});

var data = {
  a: 1,
  b: 2,
  c: 3,
  z: {
    a: 100,
    b: 200
  }
};
var parent = jp.parent(data, "$.z.b");
