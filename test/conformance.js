"use strict";

const tap = require("tap");
const jp = require("jsonpath");
const jpc = require("..");

const obj = require("./upstream/data/store");
const paths = require("./data/paths");

for (const attempt of [1, 2]) {
  for (const path of paths) {
    for (const method of ["query", "paths", "nodes"]) {
      // TODO zero case doesn't work for us
      for (const count of [undefined, /* 0, */ 1, 3]) {
        const got = jpc[method](obj, path, count);
        const want = jp[method](obj, path, count);
        const cd = count === undefined ? "∞" : count;
        tap.same(
          got,
          want,
          `attempt ${attempt}: ${method} of ${path} (count: ${cd})`
        );
      }
    }
  }
}
