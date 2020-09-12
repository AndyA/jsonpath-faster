"use strict";

const inspect = require("../lib/inspect");
//const jp = require("..");
//const prettier = require("prettier");

const esprima = require("esprima");

console.log(inspect(esprima.parse(`const jp = require("..")`)));
console.log(inspect(esprima.parse(`const jp = require("..").strict`)));
