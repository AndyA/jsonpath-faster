"use strict";

const _ = require("lodash");
const jp = require("..");
const examples = require("../ref/ast");

const leafNodes = obj =>
  _.fromPairs(
    jp
      .nodes(obj, "$..*")
      .filter(nd => !_.isObject(nd.value))
      .map(({ path, value }) => [
        jp
          .stringify(path)
          .replace(/\[\d+\]/g, "[*]")
          .substr(2),
        value
      ])
  );

const rows = [];
for (const { path, ast } of examples) {
  for (const tok of ast) {
    const shape = leafNodes(tok);
    shape.path = path;
    rows.push(shape);
  }
}

const cols = Object.keys(Object.assign({}, ...rows));
console.log(cols.join("\t"));
for (const row of rows) console.log(cols.map(c => row[c] || "").join("\t"));
