// HEAD $..* nodes count: ∞
"use strict";

const Benchmark = require("benchmark");
const { obj } = require("./spec");

const ast = [
  { expression: { type: "root", value: "$" } },
  {
    expression: { type: "wildcard", value: "*" },
    scope: "descendant",
    operation: "member"
  }
];

const ctx = { trackPath: true, counted: false };

function baseline(obj, count, extra) {
  const stack = [];
  const nodes = [];
  // use isObject
  const isObject = o => o === Object(o);

  const f1 = (o, cb, self, ...path) => {
    if (Array.isArray(o)) {
      for (let i3 = 0; i3 < o.length; i3 += 1) cb(o, i3, ...path, i3);
      for (let i4 = 0; i4 < o.length; i4 += 1)
        self(o[i4], cb, self, ...path, i4);
    } else if (isObject(o)) {
      for (const i1 in o) cb(o, i1, ...path, i1);
      for (const i2 in o) self(o[i2], cb, self, ...path, i2);
    }
  };

  stack.push("$");
  f1(
    obj,
    (o, i, ...part) => {
      stack.push(part);
      const path = stack.flat();
      nodes.push({ path, value: o[i] });
      stack.pop();
    },
    f1
  );
  stack.pop();
  return nodes;
}

function optimised(obj, count, extra) {
  const path = [];
  const nodes = [];
  // use isObject
  const isObject = o => o === Object(o);

  const f1 = (o, cb, self) => {
    if (Array.isArray(o)) {
      for (let i3 = 0; i3 < o.length; i3 += 1) {
        path.push(i3);
        cb(o, i3);
        path.pop();
      }
      for (let i4 = 0; i4 < o.length; i4 += 1) {
        path.push(i4);
        self(o[i4], cb, self);
        path.pop();
      }
    } else if (isObject(o)) {
      for (const i1 in o) {
        path.push(i1);
        cb(o, i1);
        path.pop();
      }
      for (const i2 in o) {
        path.push(i2);
        self(o[i2], cb, self);
        path.pop();
      }
    }
  };

  path.push("$");
  f1(
    obj,
    (o, i) => {
      nodes.push({ path, value: o[i] });
    },
    f1
  );
  path.pop();
  return nodes;
}

const suite = new Benchmark.Suite();

suite
  .add(`baseline`, function() {
    baseline(obj);
  })
  .add(`optimised`, function() {
    optimised(obj);
  })
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
