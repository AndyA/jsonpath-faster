"use strict";

const tap = require("tap");
const _ = require("lodash");
const jp = require("..");

const { makeTokenMatcher, stripRoot } = require("../lib/tokens");

tap.formatSnapshot = obj => JSON.stringify(obj, null, 2);

const data = [
  { expression: { type: "root", value: "$" } },
  {
    expression: { type: "wildcard", value: "*" },
    scope: "child",
    operation: "member"
  },
  {
    expression: { type: "wildcard", value: "*" },
    scope: "descendant",
    operation: "member"
  },
  {
    expression: { type: "identifier", value: "store" },
    scope: "child",
    operation: "member"
  },
  {
    expression: { type: "identifier", value: "bicycle" },
    scope: "child",
    operation: "member"
  }
];

const tests = [
  { name: "match all", when: {} },
  { name: "root", when: { expression: { type: "root", value: "$" } } },
  { name: "child member", when: { scope: "child", operation: "member" } },
  {
    name: "root or descendant",
    when: [
      { expression: { type: "root", value: "$" } },
      { scope: "descendant" }
    ]
  },
  {
    name: "function",
    when: tok => tok.expression.value === "*"
  },
  {
    name: "functional property",
    when: {
      expression: { value: v => v === "*" }
    }
  }
];

for (const { name, when } of tests) {
  const test = makeTokenMatcher(when);
  const [included, excluded] = _.partition(data, test);
  tap.matchSnapshot({ included, excluded }, name);
}

const ast1 = jp.parse("$.foo.bar");
const [head, ...tail] = ast1;
const ast2 = stripRoot(ast1);
tap.same(ast2, tail, `root stripped`);
const ast3 = stripRoot(ast2);
tap.same(ast3, tail, `root stripped again (NOP)`);
