"use strict";

const tap = require("tap");
const jp = require("..");
const { MultiPath } = require("../lib/multipath");

const obj = require("./upstream/data/store");
const paths = require("./data/paths");

const want = paths.flatMap(path => jp.nodes(obj, path));
const mp = new MultiPath();
const got = [];
for (const path of paths)
  mp.addVisitor(path, (value, path) => got.push({ value, path }));
mp.compile()(obj);

tap.same(got, want, `MultiPath`);
