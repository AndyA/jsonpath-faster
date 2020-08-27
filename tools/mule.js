"use strict";

const inspect = require("../lib/inspect");
const jp = require("..");

const paths = [
  ["$", "foo", "bar", 3, "name"],
  ["$", ".", "bar", 3, "name"],
  ["$", "\n", "", 3, "name"],
  ["$", "1", "2", 3, "name"]
];

function stringify(ast) {
  return ast
    .map(function(tok, index) {
      if (!index) return "$";
      if (typeof tok === "number") return "[" + tok + "]";
      if (/^[a-z]\w*$/.test(tok)) return "." + tok;
      return "[" + JSON.stringify(tok) + "]";
    })
    .join("");
}

for (const ast of paths) {
  const js = jp.stringify(ast);
  const as = stringify(ast);
  console.log(`${js} -> ${as}`);
}
