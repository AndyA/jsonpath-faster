"use strict";

const inspect = require("../lib/inspect");

const Compiler = require("../lib/compiler");
const Cache = require("../lib/compat/cache");

const selectorCompiler = require("../lib/compilers/selectors");
const callbackCompiler = require("../lib/compilers/callback");
const lib = require("../lib/compilers/lib");

const compiler = new Compiler(callbackCompiler, selectorCompiler, lib);
//
// I'd like this to work. Think it can. However the appeal is
// limited to literal paths.
//  jp`$.names[${i}][${j}]..id`.each(obj, (value, path) => {});

// This would also be nice.
//  const v = jp`$.name[0][0].id`.value(obj);

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

const jp = new JSONPath();

const obj = require("../test/upstream/data/store");

for (const has of ["category", "author", "isbn"]) {
  const books = jp`$.store.book[?(@.${has})]`.paths(obj);
  //  const books = jp.paths(obj, `$.store.book[?(@.${has})]`);
  console.log(inspect(books));
}
