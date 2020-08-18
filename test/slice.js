"use strict";

const tap = require("tap");
const genfun = require("generate-function");

const { parseSlice, renderSlice } = require("../lib/slice");

const list = ["a", "b", "c", "d", "e", "f", "g", "h", "i"];

const tests = [
  { slice: "1:", want: ["b", "c", "d", "e", "f", "g", "h", "i"] },
  { slice: "-3:", want: ["g", "h", "i"] },
  { slice: ":", want: ["a", "b", "c", "d", "e", "f", "g", "h", "i"] },
  { slice: "::", want: ["a", "b", "c", "d", "e", "f", "g", "h", "i"] },
  { slice: "::3", want: ["a", "d", "g"] },
  { slice: "2::-1", want: ["c", "b", "a"] },
  { slice: "2:0:-1", want: ["c", "b"] },
  { slice: "-1:-4:-2", want: ["i", "g"] },
  { slice: "::-1", want: ["i", "h", "g", "f", "e", "d", "c", "b", "a"] },
  { slice: ":1000", want: ["a", "b", "c", "d", "e", "f", "g", "h", "i"] },
  { slice: "-1000:1000", want: ["a", "b", "c", "d", "e", "f", "g", "h", "i"] },
  {
    slice: "1000:-1000:-1",
    want: ["i", "h", "g", "f", "e", "d", "c", "b", "a"]
  },
  { slice: "0:0", want: [] },
  { slice: "0:0:-1", want: [] }
];

function runSlice(list, slice) {
  const ns = {};
  const ctx = {
    sym(...pfxs) {
      return pfxs.map(pfx => `${pfx}${(ns[pfx] = (ns[pfx] || 0) + 1)}`);
    }
  };

  const [start, end, step] = parseSlice(slice);
  const render = renderSlice(ctx, start, end, step);
  const code = render("list", i => `out.push(list[${i}])`);
  //  console.log(`// ${slice}\n${code}`);

  const gen = genfun();
  gen(`list => { ${code} }`);
  const out = [];
  const fun = gen.toFunction({ out });
  fun(list);
  return out;
}

for (const test of tests) {
  const got = runSlice(list, test.slice);
  tap.same(got, test.want, `slice ${test.slice}`);
}
