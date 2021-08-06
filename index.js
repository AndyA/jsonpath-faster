"use strict";

const Compiler = require("./lib/compiler");
const makeEngine = require("./lib/compat/engine");
const addPragmas = require("./lib/pragmas");

const selectorCompiler = require("./lib/compiler/selectors");
const structureCompiler = require("./lib/compiler/structure");
const lib = require("./lib/compiler/lib");

function JSONPath(opt = {}) {
  const compiler = new Compiler(structureCompiler, selectorCompiler, lib);
  const engine = makeEngine(opt);

  const construct = proto => {
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

    return Object.assign(jp, proto, engine, {
      JSONPath,
      compiler,
      nest(path) {
        const { Nest } = require("./lib/nest");
        const mountPoint = path ? jp.parse(path) : [];
        return new Nest(this, mountPoint);
      }
    });
  };

  return addPragmas(
    construct({}),
    ["leaf", "interior", "string", "strict"],
    obj => construct(obj)
  );
}

module.exports = JSONPath();
