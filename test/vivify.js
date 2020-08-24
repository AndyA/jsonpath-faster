"use strict";

const tap = require("tap");
const jp = require("..");

const tests = [
  {
    path: "$.name",
    value: "Smoo",
    want: { name: "Smoo" }
  },
  {
    path: "$.person[1].name",
    value: "Smoo",
    want: { person: [undefined, { name: "Smoo" }] }
  },
  {
    path: "$.*.name",
    value: "Pizzo",
    want: {}
  },
  {
    path: "$.person[(1-1)].name",
    value: "Pizzo",
    want: { person: [{ name: "Pizzo" }] },
    obj: { person: [] }
  }
];

for (const { path, value, want, obj } of tests) {
  const t = obj || {};
  jp.value(t, path, value);
  tap.same(t, want, path);
}
