"use strict";

const tap = require("tap");
const jp = require("..");

const tests = [
  // Positives
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
    path: "$.person[(1-1)].name",
    value: "Pizzo",
    want: { person: [{ name: "Pizzo" }] }
  },
  {
    path: '$[("rec")].person[(1-1)].name',
    value: "Pizzo",
    want: { rec: { person: [{ name: "Pizzo" }] } }
  },
  {
    path: "$..link.id",
    value: "abc",
    obj: { items: [{ link: { id: "xyz" } }, { link: { id: "def" } }] },
    want: { items: [{ link: { id: "abc" } }, { link: { id: "def" } }] }
  },
  {
    path: "$..id",
    value: "Bob",
    obj: {
      vectors: [
        { id: "Perkins", length: 3.2 },
        { id: "Larynx", length: 2.3 }
      ]
    },
    want: {
      vectors: [
        { id: "Bob", length: 3.2 },
        { id: "Larynx", length: 2.3 }
      ]
    }
  },
  // Negatives
  {
    path: "$.*.name",
    value: "Pizzo",
    want: {}
  },
  {
    path: "$.foo.*.id",
    value: "Andy",
    want: {}
  },
  {
    path: "$.foo..id",
    value: "Andy",
    want: {}
  }
];

for (const { path, value, want, obj, flags } of tests) {
  const t = obj || {};
  jp.value(t, path, value);
  tap.same(t, want, flags || {}, path);
}
