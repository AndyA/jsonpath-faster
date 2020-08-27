"use strict";

const tap = require("tap");

const jp = require("..");

const obj = require("./upstream/data/store");

tap.formatSnapshot = obj => JSON.stringify(obj, null, 2);

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
