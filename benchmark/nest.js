"use strict";

const Benchmark = require("benchmark");
const _ = require("lodash");
const jp = require("..");
const jpBase = require("jsonpath");

const spec = require("./spec");

function work(value, path) {
  // Nothing
}

function longhand(jp, count, paths) {
  return function() {
    for (let i = 0; i < count; i++)
      for (const searchPath of paths)
        for (const { path, value } of jp.nodes(spec.obj, searchPath))
          work(value, jp.stringify(path));
  };
}

function baseline(count, paths) {
  return longhand(jpBase, count, paths);
}

function discreet(count, paths) {
  return longhand(jp, count, paths);
}

function nest(count, paths) {
  const view = jp.nest().string.unordered;
  for (const path of paths) view.visitor(path, work);
  return function() {
    for (let i = 0; i < count; i++) view(spec.obj);
  };
}

const wilden = path => path.replace(/\[\d+\]/g, "[*]");

const unionPaths = [
  "$.store.book[0,1,2,3].category",
  "$.store.book[0,1,2,3].author",
  "$.store.book[0,1,2,3].title",
  "$.store.book[0,1,2,3].price",
  "$.store.bicycle.color",
  "$.store.bicycle.price"
];

const leafPaths = jp.string.leaf.paths(spec.obj, "$..*");

const wildPaths = _.uniq(leafPaths.map(wilden));

const tests = [
  { name: "search", paths: ["$..*"] },
  { name: "multipath", paths: spec.paths },
  { name: "leafs", paths: leafPaths },
  { name: "wild leafs", paths: wildPaths },
  { name: "union leafs", paths: unionPaths }
];

for (const count of [1, 10, 100, 1000]) {
  for (const { name, paths } of tests) {
    const suite = new Benchmark.Suite();
    const ar = _.range(count);

    let x = 0;
    const cb = (el, i, o) => (x = x + i);
    suite
      .add(`${name} baseline ${count}`, baseline(count, paths))
      .add(`${name} discreet ${count}`, discreet(count, paths))
      .add(`${name} nest ${count}`, nest(count, paths));

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
}
