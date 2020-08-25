"use strict";

const js = expr => JSON.stringify(expr);
const lv = (lval, i) => `${lval}[${i}]`;

module.exports = { js, lv };
