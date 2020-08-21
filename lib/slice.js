"use strict";

const genfun = require("generate-function");

const { parseSlice, renderSlice, makeSlice } = require("./slicer");

// This hacky bodge allows us to pass jsonpath's slice test
// (which expects this module to be a function)
const slice = (data, start = null, end = null, step = null) => {
  const ns = {};
  const ctx = {
    sym(...pfxs) {
      return pfxs.map(pfx => `${pfx}${(ns[pfx] = (ns[pfx] || 0) + 1)}`);
    }
  };

  const code = renderSlice(
    ctx,
    start,
    end,
    step
  )("data", i => `out.push(data[${i}])`);

  const gen = genfun();
  gen(`data => { ${code} }`);
  const out = [];
  const fun = gen.toFunction({ out });
  fun(data);

  return out;
};

module.exports = Object.assign(slice, { parseSlice, renderSlice, makeSlice });
