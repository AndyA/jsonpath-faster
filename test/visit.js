"use strict";

const tap = require("tap");
const jp = require("..");

tap.test("vivify root", async () => {
  const obj = jp.visit(undefined, "$", () => "Hello");
  tap.same(obj, "Hello", "vivified root");
});
