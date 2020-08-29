"use strict";

const tap = require("tap");
const jp = require("..");

const obj = require("./upstream/data/store");

const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

const collect = (nest, obj) => {
  const log = [];
  nest.string.leaf.visitor("$..*", (value, path) => log.push({ path, value }));
  nest(obj);
  return log.sort((a, b) => cmp(a.path, b.path));
};

const want = collect(jp.nest(), obj);
const got = collect(jp.nest().unordered, obj);
tap.same(got, want, `unordered`);
