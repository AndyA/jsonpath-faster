"use strict";

const _ = require("lodash");
const jp = require("..");
const { vivifyTokens } = require("../lib/compilers/vivifiers");
const { inspect } = require("../lib/util");
const { Nest } = require("../lib/multipath");

const sets = [
  "$..id",
  "$.foo[3].bar[1]",
  "$.foo[($.idx)]",
  ["$.foo.bar", "$.foo.baz"]
];

for (const set of sets) {
  const nest = new Nest();
  const paths = _.castArray(set);
  for (const path of paths) {
    const ast = jp.parse(path);
    nest.add(ast);
  }
  const viv = vivifyTokens(nest.render());
  console.log(inspect({ paths, viv }));
}
