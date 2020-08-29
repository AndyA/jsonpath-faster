"use strict";

const tap = require("tap");

const jp = require("..");
const { makeTree, mergeTrees, renderTree } = require("../lib/merge");

tap.formatSnapshot = obj => JSON.stringify(obj, null, 2);

tap.test(`makeTree`, async () => {
  const ast = jp.parse("$..*");

  const t1 = makeTree(ast);
  tap.matchSnapshot(t1, `makeTree makes trees`);

  const t2 = makeTree(t1);
  tap.same(t1, t2, `makeTree passes trees`);

  const [t3, t4] = ["$.foo.foo", "$.foo.bar"].map(path =>
    makeTree(jp.parse(path))
  );

  const m1 = renderTree(mergeTrees([], mergeTrees(t3, t4)));
  tap.matchSnapshot(m1, `renderTree renders forks`);

  const tx = makeTree(m1);
  tap.matchSnapshot(tx, `makeTree parses forks`);
});

tap.test(`mergeTrees`, async () => {
  const [t1, t2, t3, t4] = [
    "$.foo.foo",
    "$.foo.bar",
    "$.bar.foo",
    "$.bar.bar"
  ].map(path => makeTree(jp.parse(path)));

  const a1 = renderTree(mergeTrees(t1, t2));
  const a2 = renderTree(mergeTrees(t3, t4));

  tap.matchSnapshot({ a1, a2 }, `mergeTrees merges simple ASTs`);

  const [t5, t6] = [a1, a2].map(makeTree);
  tap.matchSnapshot({ t5, t6 }, `mergeTrees merges forked ASTs #1`);

  const m1 = renderTree(mergeTrees(t5, t6));
  tap.matchSnapshot({ m1 }, `mergeTrees merges forked ASTs #2`);
});
