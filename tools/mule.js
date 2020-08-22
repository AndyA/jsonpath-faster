"use strict";

const esprima = require("esprima");
const estraverse = require("estraverse");
const escodegen = require("escodegen");
const { inspect } = require("../lib/util");

const exprs = ["hit", "hit.miss"];
for (const expr of exprs) {
  console.log(`// ${expr}`);
  console.log(inspect(esprima.parse(expr)));
}
