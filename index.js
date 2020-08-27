"use strict";

const Compiler = require("./lib/compiler");
const Cache = require("./lib/compat/cache");

const selectorCompiler = require("./lib/compilers/selectors");
const callbackCompiler = require("./lib/compilers/callback");
const lib = require("./lib/compilers/lib");

const compiler = new Compiler(callbackCompiler, selectorCompiler, lib);

function JSONPath() {
  const cache = new Cache(compiler);
  const jp = (strings, ...key) => {};

  return Object.assign(jp, { JSONPath }, cache);
}

module.exports = new JSONPath();
