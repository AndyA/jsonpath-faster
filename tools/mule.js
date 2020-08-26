"use strict";

const inspect = require("../lib/inspect");
const jp = require("..");
const prettier = require("prettier");
const { makeTerminal } = require("../lib/tokens");
const { MultiPath } = require("../lib/multipath");

if (1) {
  const obj = require("../test/upstream/data/store");
  const paths = require("../test/data/paths");

  const mp = new MultiPath();
  const got = [];
  const want = [];
  for (const testPath of paths) {
    const nodes = jp.nodes(obj, testPath);
    for (const { path, value } of nodes)
      want.push({ testPath, path: jp.stringify(path), value });
    mp.addVisitor(testPath, (value, path) =>
      got.push({ testPath, path: jp.stringify(path), value })
    );
  }
  const code = mp.code();
  const pretty = prettier.format(`module.exports = ${code}`, {
    filepath: "code.js"
  });
  console.log(pretty);
  //  mp.compile()(obj);
  //  console.log(JSON.stringify({ got, want }, null, 2));
}

if (0) {
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
}

if (0) {
  const ast = jp.parse("$.foo.bar");
  const code = jp.compiler.compile(
    [...ast, makeTerminal(`@.value = @.pathString`)],
    {
      order: true
    }
  );
  const pretty = prettier.format(code, {
    filepath: "code.js"
  });
  console.log(pretty);
}
