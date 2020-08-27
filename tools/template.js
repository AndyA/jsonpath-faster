"use strict";

const inspect = require("../lib/inspect");

const Compiler = require("../lib/compiler");
const Cache = require("../lib/compat/cache");

const selectorCompiler = require("../lib/compilers/selectors");
const callbackCompiler = require("../lib/compilers/callback");
const lib = require("../lib/compilers/lib");

const compiler = new Compiler(callbackCompiler, selectorCompiler, lib);

function JSONPath() {
  const cache = new Cache(compiler);
  const jp = (...args) => jp._template(...args);

  return Object.assign(jp, { JSONPath }, cache, {
    _template(strings, ...key) {
      console.log(inspect({ strings, key }));
    }
  });
}

const jp = new JSONPath();
const obj = { foo: [1, 2, 3] };
console.log(jp.nodes(obj, "$..*"));
const i = 1;
jp`$.names[${i}]`;

const jj = new jp.JSONPath();
jj`$.foo`;

process.exit(1);

// I'd like this to work. Think it can. However the appeal is
// limited to literal paths.
jp`$.names[${i}][${j}]..id`.each(obj, (value, path) => {});

// This would also be nice.
const v = jp`$.name[0][0].id`.value(obj);
