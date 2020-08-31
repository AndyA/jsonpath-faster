"use strict";

const Benchmark = require("benchmark");
const _ = require("lodash");

const spec = require("./spec");

for (const count of [1, 10, 100, 1000, 10000, 100000]) {
  const suite = new Benchmark.Suite();
  const ar = _.range(count);

  let x = 0;
  const cb = (el, i, o) => (x = x + i);
  suite
    .add(`for ${count} (length in var)`, function() {
      const len = ar.length;
      for (let i = 0; i < len; i++) cb({}, i, ar);
    })
    .add(`forEach ${count}`, function() {
      ar.forEach(cb);
    })
    .add(`for ${count}`, function() {
      for (let i = 0; i < ar.length; i++) cb({}, i, ar);
    });

  suite
    .on("cycle", function(event) {
      console.log(`//  ${event.target}`);
    })
    .on("complete", function() {
      console.log("// Fastest is " + this.filter("fastest").map("name"));
    })
    .on("error", function(e) {
      console.error(e);
      process.exit(1);
    })
    .run();
}
