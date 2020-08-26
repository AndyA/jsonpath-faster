"use strict";

const tap = require("tap");
const jp = require("..");
const { MultiPath } = require("../lib/multipath");
const { makeTerminal } = require("../lib/tokens");

const nest = new MultiPath();
const paths = ["$.foo.bar", "$.foo.baz"];
const obj = { foo: { bar: "Hello", baz: "Bye!" } };

for (const path of paths) {
  const ast = jp.parse(path);
  nest.add([...ast, makeTerminal(`$.log.push([@.value, @.pathString])`)]);
}

const $ = { log: [] };
nest.compile()(obj, $);
const want = {
  log: [
    ["Hello", "$.foo.bar"],
    ["Bye!", "$.foo.baz"]
  ]
};

tap.same($, want, `natural ordering of MultiPath`);
