"use strict";

const tap = require("tap");
const jp = require("..");

const obj = require("./upstream/data/store");

const leaves = jp.string.leaf.paths(obj, "$..*");
const inners = jp.string.interior.paths(obj, "$..*");
const empty = jp.string.leaf.interior.paths(obj, "$..*");

const want = {
  empty: [],
  leaves: [
    "$.store.book[0].category",
    "$.store.book[0].author",
    "$.store.book[0].title",
    "$.store.book[0].price",
    "$.store.book[1].category",
    "$.store.book[1].author",
    "$.store.book[1].title",
    "$.store.book[1].price",
    "$.store.book[2].category",
    "$.store.book[2].author",
    "$.store.book[2].title",
    "$.store.book[2].isbn",
    "$.store.book[2].price",
    "$.store.book[3].category",
    "$.store.book[3].author",
    "$.store.book[3].title",
    "$.store.book[3].isbn",
    "$.store.book[3].price",
    "$.store.bicycle.color",
    "$.store.bicycle.price"
  ],
  inners: [
    "$.store",
    "$.store.book",
    "$.store.bicycle",
    "$.store.book[0]",
    "$.store.book[1]",
    "$.store.book[2]",
    "$.store.book[3]"
  ]
};

tap.same({ empty, leaves, inners }, want, `pragma chain`);

const tips = jp.string.leaf`$..*`.paths(obj);
tap.same(tips, want.leaves, `pragma chain + template`);
