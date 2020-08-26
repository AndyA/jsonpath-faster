"use strict";

const js = expr => JSON.stringify(expr);
const lv = (lval, i) => `${lval}[${i}]`;

const mergeOr = (dst, src) => {
  for (const key in src) if (src[key]) dst[key] = true;
  return dst;
};

const fun = x => (typeof x === "function" ? x : () => x);

module.exports = { js, lv, mergeOr, fun };
