"use strict";

const inspect = require("../lib/inspect");
const jp = require("..");
const prettier = require("prettier");

jp.compiler.on("compile", info => {
  //  console.log(info.code);
  const pretty = prettier.format(info.code, { filepath: "code.js" });
  console.log(pretty);
});

const nest = jp.nest().string;

nest.mutator("$..id", value => value.toLowerCase());

const doc = {
  author: { id: "ABC", name: "Smoo" },
  editor: { id: "DEF", name: "Pizzo!" }
};

const want = {
  author: { id: "abc", name: "Smoo" },
  editor: { id: "def", name: "Pizzo!" }
};

const got = nest(doc);
