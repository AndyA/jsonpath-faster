"use strict";

const Compiler = require("./lib/compiler");
const Cache = require("./lib/compat/cache");

const selectorCompiler = require("./lib/compilers/selectors");
const callbackCompiler = require("./lib/compilers/callback");
const lib = require("./lib/compilers/lib");

const compiler = new Compiler(callbackCompiler, selectorCompiler, lib);

class JSONPath extends Cache {
  constructor() {
    super(compiler);
  }
}

const jp = new JSONPath();
jp.JSONPath = JSONPath;

module.exports = jp;
