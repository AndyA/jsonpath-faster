"use strict";

const Compiler = require("./lib/compiler");
const Cache = require("./lib/compat/cache");
const addPragmas = require("./lib/pragmas");

const selectorCompiler = require("./lib/compilers/selectors");
const callbackCompiler = require("./lib/compilers/callback");
const lib = require("./lib/compilers/lib");

function JSONPath() {
  const compiler = new Compiler(callbackCompiler, selectorCompiler, lib);

  const construct = proto => {
    const cache = new Cache(compiler);

    // Handle tagged template literals
    //  jp`$.foo[${x}]`.value(obj, true)
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

    return Object.assign(jp, proto, { JSONPath }, cache, {
      nest() {
        const { Nest } = require("./lib/nest");
        return new Nest(this);
      }
    });
  };

  return addPragmas(construct({}), ["leaf", "interior", "string"], obj =>
    construct(obj)
  );
}

module.exports = new JSONPath();
