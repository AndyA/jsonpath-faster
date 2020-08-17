"use strict";

const undefer = (v, ...args) => (typeof v === "function" ? v(...args) : v);

const json = obj => JSON.stringify(obj, null, 2);
const js = expr => JSON.stringify(expr);
const lv = (lval, i) => `${lval}[${i}]`;

const isObject = o => o === Object(o);

const inspect = obj =>
  util.inspect(obj, {
    depth: null,
    sorted: true,
    getters: true
  });

module.exports = { undefer, json, js, lv, isObject, inspect };
