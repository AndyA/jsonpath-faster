"use strict";

const inspect = require("../lib/inspect");
const jp = require("..");

function base() {
  console.log("Ahoy!");
}

base.foo = function() {
  console.log("Foo!");
};

const obj = Object.create(base);
console.log(obj);
obj();
obj.foo();
