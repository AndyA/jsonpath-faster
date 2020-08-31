"use strict";

const Benchmark = require("benchmark");
const _ = require("lodash");
const jp = require("..");
const jpBase = require("jsonpath");

const spec = require("./spec");

function work(value, path) {
  // Nothing
}

function longhand(jp, count) {
  return function() {
    for (let i = 0; i < count; i++)
      for (const searchPath of spec.paths)
        for (const { path, value } of jp.nodes(spec.obj, searchPath))
          work(value, jp.stringify(path));
  };
}

function baseline(count) {
  return longhand(jpBase, count);
}

function discreet(count) {
  return longhand(jp, count);
}

function nest(count) {
  const view = jp.nest().string.unordered;
  for (const path of spec.paths) view.visitor(path, work);
  return function() {
    for (let i = 0; i < count; i++) view(spec.obj);
  };
}

for (const count of [1, 10, 100, 1000]) {
  const suite = new Benchmark.Suite();
  const ar = _.range(count);

  let x = 0;
  const cb = (el, i, o) => (x = x + i);
  suite
    .add(`baseline ${count}`, baseline(count))
    .add(`discreet ${count}`, discreet(count))
    .add(`nest ${count}`, nest(count));

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
