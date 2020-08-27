"use strict";

const tap = require("tap");
const jp = require("..");

const obj = {
  names: ["Andy", "Smoo", "Pizzo!"],
  meta: { id: "lkdfnzkdhsod", version: 3 },
  docs: [
    { name: "Main Manual", id: 1 },
    { name: "Appendix I", id: 2 },
    { name: "Appendix II", id: 3 }
  ]
};

const tests = [
  {
    op: $ => jp.query(obj, "$.names[($.index)]", $),
    cases: [
      { $: { index: 1 }, want: ["Smoo"] },
      { $: { index: 3 }, want: [] }
    ]
  },
  {
    op: $ => jp.query(obj, "$..[($.sel)]", 2, $),
    cases: [{ $: { sel: "id" }, want: ["lkdfnzkdhsod", 1] }]
  },
  {
    op: $ => jp.nodes(obj, "$..[($.sel)]", $),
    cases: [
      {
        $: { sel: "id" },
        want: [
          { path: ["$", "meta", "id"], value: "lkdfnzkdhsod" },
          { path: ["$", "docs", 0, "id"], value: 1 },
          { path: ["$", "docs", 1, "id"], value: 2 },
          { path: ["$", "docs", 2, "id"], value: 3 }
        ]
      },
      {
        $: { sel: "name" },
        want: [
          { path: ["$", "docs", 0, "name"], value: "Main Manual" },
          { path: ["$", "docs", 1, "name"], value: "Appendix I" },
          { path: ["$", "docs", 2, "name"], value: "Appendix II" }
        ]
      }
    ]
  },
  {
    op: $ => jp.nodes(obj, "$..[($.sel)]", 1, $),
    cases: [
      {
        $: { sel: "id" },
        want: [{ path: ["$", "meta", "id"], value: "lkdfnzkdhsod" }]
      }
    ]
  },
  {
    op: $ => jp.paths(obj, "$..[?(@[$.sel])]", $),
    cases: [
      {
        $: { sel: "name" },
        want: [
          ["$", "docs", 0],
          ["$", "docs", 1],
          ["$", "docs", 2]
        ]
      },
      { $: { sel: "version" }, want: [["$", "meta"]] }
    ]
  },
  {
    op: $ => jp.paths(obj, "$..[?(@[$.sel])]", 2, $),
    cases: [
      {
        $: { sel: "name" },
        want: [
          ["$", "docs", 0],
          ["$", "docs", 1]
        ]
      }
    ]
  },
  {
    op: $ => jp.value(obj, "$.docs[($.index)].name", undefined, $),
    cases: [{ $: { index: 1 }, want: "Appendix I" }]
  },
  {
    op: $ => jp.value(obj, "$.docs[($.index)].name", "Private", $),
    cases: [
      {
        $: { index: 1 },
        want: "Private",
        also: name =>
          tap.equal(obj.docs[1].name, "Private", `${name}: data changed`)
      }
    ]
  },
  {
    op: $ => jp.parent(obj, "$.meta[($.what)]", $),
    cases: [{ $: { what: "id" }, want: { id: "lkdfnzkdhsod", version: 3 } }]
  },
  {
    op: $ => jp.apply(obj, "$.docs[($.doc)].name", () => "Sunshine", $),
    cases: [
      {
        $: { doc: 1 },
        want: [{ path: ["$", "docs", 1, "name"], value: "Sunshine" }],
        also: name =>
          tap.equal(obj.docs[1].name, "Sunshine", `${name}: data changed`)
      }
    ]
  }
];

for (const { op, cases } of tests) {
  for (const { $, want, also } of cases) {
    const name = `${op.toString()} $=${JSON.stringify($)}`;
    const got = op($);
    tap.same(got, want, name);
    if (also) also(name);
  }
}
