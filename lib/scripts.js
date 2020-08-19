"use strict";

const { nestedLiterals, mergeLiterals } = require("./nested");

const codeMapper = (str, mapper) =>
  nestedLiterals(str)
    .map(([frag, depth, code]) => (code ? mapper(frag) : frag))
    .join("");

const bindScript = (expr, lval) => codeMapper(expr, s => s.replace(/@/g, lval));

const bindFilter = (expr, lval) => {
  const m = expr.match(/^\?\((.*)\)$/);
  if (!m) throw new Error(`Can't parse filter ${expr}`);
  return bindScript(m[1], lval);
};

module.exports = { bindScript, bindFilter };
