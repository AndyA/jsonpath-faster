"use strict";

const _ = require("lodash");
const inspect = require("../lib/inspect");

const jp = require("..");

jp.compiler.on("compile", info => {
  console.log(inspect(info));
});

const obj = [];

for (let x = 0; x < 3; x++) {
  for (let y = 0; y < 3; y++) {
    for (let z = 0; z < 3; z++) {
      jp`$[${x}][${y}][${z}]`.value(obj, { x, y, z });
    }
  }
}

console.log(inspect(obj));

const grid = _.range(3).map(x =>
  _.range(3).map(y => _.range(3).map(z => ({ x, y, z })))
);
console.log(inspect(grid));
