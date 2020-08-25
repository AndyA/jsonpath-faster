"use strict";

const tap = require("tap");

const _ = require("lodash");
const jp = require("..");
const { vivifyTokens } = require("../lib/compilers/vivifiers");
const { inspect } = require("../lib/util");
const { Nest } = require("../lib/multipath");

const sets = [
  "$..id",
  "$.foo[3].bar[1]",
  "$.foo[($.idx)]",
  ["$.foo.bar", "$.foo.baz"],
  ["$.foo.bar", "$.foo.baz[0].id", "$.foo.baz[2].id"],
  '$.person[(1-1)][("id")].name'
];

tap.formatSnapshot = obj => JSON.stringify(obj, null, 2);
for (const set of sets) {
  const nest = new Nest();
  const paths = _.castArray(set);
  const name = paths.join(", ");

  for (const path of paths) {
    const ast = jp.parse(path);
    nest.add(ast);
  }

  const viv = vivifyTokens(nest.render());
  tap.matchSnapshot(viv, name);
}
