"use strict";

const tap = require("tap");
const genfun = require("generate-function");

const { parseSlice, renderSlice, makeSlice } = require("../lib/slicer");

function runSlice(list, slice) {
  const ns = {};
  const ctx = {
    opt: {},
    sym(...pfxs) {
      return pfxs.map(pfx => `${pfx}${(ns[pfx] = (ns[pfx] || 0) + 1)}`);
    }
  };

  const code = makeSlice(ctx, slice)("list", i => `out.push(list[${i}])`);
  //  console.log(`// ${slice}\n${code}`);

  const gen = genfun();
  gen(`list => { ${code} }`);
  const out = [];
  const fun = gen.toFunction({ out });
  fun(list);
  return out;
}

const list = ["a", "b", "c", "d", "e", "f", "g", "h", "i"];

const positive = [
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

for (const test of positive) {
  const got = runSlice(list, test.slice);
  tap.same(got, test.want, `slice ${test.slice}`);
}

const negative = [
  { slice: "0:0:0:0", want: /too many/i },
  { slice: "0", want: /too few/i },
  { slice: "0:x", want: /numeric/i },
  { slice: "0::0", want: /step/i }
];

for (const test of negative) {
  tap.throws(
    () => runSlice(list, test.slice),
    test.want,
    `${test.slice} throws ${test.want}`
  );
}
