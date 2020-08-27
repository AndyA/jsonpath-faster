"use strict";

const Compiler = require("./lib/compiler");
const Cache = require("./lib/compat/cache");

const selectorCompiler = require("./lib/compilers/selectors");
const callbackCompiler = require("./lib/compilers/callback");
const lib = require("./lib/compilers/lib");

const compiler = new Compiler(callbackCompiler, selectorCompiler, lib);

function JSONPath() {
  const cache = new Cache(compiler);

  const jp = (parts, ...$) => {
    let idx = 0;
    const path = parts.reduce((a, b) => `${a}($[${idx++}])${b}`);
    return {
      query: (obj, count) => jp.query(obj, path, count, $),
      paths: (obj, count) => jp.paths(obj, path, count, $),
      nodes: (obj, count) => jp.nodes(obj, path, count, $),
      value: (obj, newValue) => jp.value(obj, path, newValue, $),
      parent: obj => jp.parent(obj, path, $),
      apply: (obj, fn) => jp.apply(obj, path, fn, $)
    };
  };

  return Object.assign(jp, { JSONPath }, cache);
}

module.exports = new JSONPath();
