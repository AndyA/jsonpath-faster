"use strict";

const Benchmark = require("benchmark");
const _ = require("lodash");
const jp = require("..");
const jpb = require("jsonpath");

const spec = require("./spec");

const jpn = {
  stringify(ast) {
    return ast
      .map(function(tok, index) {
        if (!index) return "$";
        if (typeof tok === "number") return "[" + tok + "]";
        if (/^[_a-z]\w*$/i.test(tok)) return "." + tok;
        return "[" + JSON.stringify(tok) + "]";
      })
      .join("");
  }
};

const jpx = {
  stringify(ast) {
    var path = "$";
    for (var i = 1; i < ast.length; i++) {
      if (typeof ast[i] === "number") path = path + "[" + ast[i] + "]";
      else if (/^[_a-z]\w*$/i.test(ast[i])) path = path + "." + ast[i];
      else path = path + "[" + JSON.stringify(ast[i]) + "]";
    }
    return path;
  }
};

const suite = new Benchmark.Suite();
const path = ["$", "foo", 3, "length", 2];

for (const jp of [jpx, jpn, jpb]) console.log(jp.stringify(path));

suite
  .add(`strongyfu`, function() {
    jpx.stringify(path);
  })
  .add(`stringify`, function() {
    jpn.stringify(path);
  })
  .add(`base stringify`, function() {
    jpb.stringify(path);
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
