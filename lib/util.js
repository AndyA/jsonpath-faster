"use strict";

const undefer = (v, ...args) => (typeof v === "function" ? v(...args) : v);

module.exports = { undefer };
