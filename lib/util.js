"use strict";

const js = expr => JSON.stringify(expr);
const lv = (lval, i) => `${lval}[${i}]`;

const isObject = o => o === Object(o);

module.exports = { js, lv, isObject };
