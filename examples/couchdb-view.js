"use strict";

const jp = require("..");
const prettier = require("prettier");

if (1) {
  const paths = [
    "$..id",
    "$.versions[0].updated",
    "$.versions[:2].touched",
    "$.meta.control.issue",
    "$.meta.control.auth",
    "$.meta.edit.issue",
    "$.meta.edit.object"
  ];

  const view = jp.nest().string.unordered;
  for (const path of paths) {
    view.at(
      path,
      "emit([doc._id, -1, @.value, @.path]); emit([@.value, 1, doc._id, @.path]);"
    );
  }

  //  view.setter("$.versions[:2].touched", x => (x || 0) + 1);

  const code = view.generate();
  const pretty = prettier.format(code, { filepath: "view.js" });
  console.log(pretty);
}
if (0) {
  const view = jp.nest().unordered;
  view.string.leaf.at("$..*", "emit([@.path, JSON.stringify(@.value)]);");
  const code = view.generate();
  const pretty = prettier.format(code, { filepath: "view.js" });
  console.log(pretty);
}
