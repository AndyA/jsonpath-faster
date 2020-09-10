"use strict";

const tap = require("tap");
const jp = require("..");

tap.test("vivify root", async () => {
  const obj = jp.visit(undefined, "$", () => "Hello");
  tap.same(obj, "Hello", "vivified root");
});

tap.test("vivify deep node", async () => {
  const doc = { id: "FOO" };
  const out = jp.visit(doc, "$.meta.author", () => "andy@hexten.net");
  tap.same(
    doc,
    { id: "FOO", meta: { author: "andy@hexten.net" } },
    "doc updated"
  );
  tap.same(doc, out, "doc returned");
});
