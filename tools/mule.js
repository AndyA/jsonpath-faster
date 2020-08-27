"use strict";

const inspect = require("../lib/inspect");
const jp = require("..");

const obj = require("../test/upstream/data/store");

jp.nest().leaf.visitor("$..*", (value, path) => console.log(path))(obj);
