"use strict";

const jp = require("..");
const prettier = require("prettier");

const paths = [
  "$..id",
  "$.meta.control.issue",
  "$.meta.control.auth",
  "$.meta.edit.issue",
  "$.meta.edit.object"
];

const view = jp.nest().unordered;
for (const path of paths) {
  view.at(path, "emit([doc._id, -1, @.value]); emit([@.value, 1, doc._id]);");
}

const code = view.generate();
const pretty = prettier.format(code, { filepath: "view.js" });
console.log(pretty);
