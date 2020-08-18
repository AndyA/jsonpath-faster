"use strict";

const Compiler = require("./compiler");

const selectorCompiler = require("./compilers/selectors");
const callbackCompiler = require("./compilers/callback");
const lib = require("./compilers/lib");

module.exports = new Compiler(callbackCompiler, selectorCompiler, lib);
