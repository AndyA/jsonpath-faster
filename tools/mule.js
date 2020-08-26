"use strict";

const inspect = require("../lib/inspect");
const jp = require("..");
const prettier = require("prettier");

const { MultiPath } = require("../lib/multipath");

const mp = new MultiPath();

mp.addAction("$.foo.bar", ctx => `console.log(@.value, @.path);`)
  .addAction("$.foo.baz", ctx => `console.log(@.value)`)
  .addAction("$.foo.bof[3].meta.control", ctx => `@.value = true`)
  .addAction("$..*", ctx => `console.log(@.pathString, @.leaf);`);

const pretty = prettier.format("module.exports = " + mp.code(), {
  filepath: "code.js"
});
console.log(pretty);

const obj = { foo: { bar: "Bar!", baz: "Baz!" } };
mp.compile()(obj, {});
console.log(inspect(obj));
