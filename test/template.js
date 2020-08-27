"use strict";

const { range } = require("lodash");
const tap = require("tap");

const jp = require("..");

tap.formatSnapshot = obj => JSON.stringify(obj, null, 2);

tap.test(`methods`, async () => {
  const obj = require("./upstream/data/store");
  const log = [];
  const applyLog = [];
  for (const limit of [10, 15, 20]) {
    const query = jp`$..[?(@.price < ${limit})]`.query(obj);
    const paths = jp`$..[?(@.price < ${limit})]`.paths(obj);
    const nodes = jp`$..[?(@.price < ${limit})]`.nodes(obj);
    const value = jp`$..[?(@.price < ${limit})]`.value(obj);
    const parent = jp`$..[?(@.price < ${limit})]`.parent(obj);

    log.push({ limit, query, paths, nodes, value, parent });

    applyLog.push(limit);
    jp`$..[?(@.price < ${limit})]`.apply(obj, v => {
      applyLog.push(v);
    });
  }

  tap.matchSnapshot(log, `method coverage`);
  tap.matchSnapshot(applyLog, `apply works as expected`);
});

tap.test(`vivify`, async () => {
  const got = [];
  for (let x = 0; x < 3; x++)
    for (let y = 0; y < 3; y++)
      for (let z = 0; z < 3; z++)
        jp`$[${x}][${y}][${z}]`.value(got, { x, y, z });

  const want = range(3).map(x =>
    range(3).map(y => range(3).map(z => ({ x, y, z })))
  );

  tap.same(got, want, `vivify matrix`);
});
