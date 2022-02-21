// See
//   https://github.com/ohler55/ojg/blob/develop/benchmarks.md

const _ = require("lodash");
const jp = require("..");

const buildTree = (size, depth, iv) =>
  depth < 1
    ? iv
    : (obj => (depth % 2 ? obj : Object.values(obj)))(
        Object.fromEntries(
          _.range(size).map(i => [
            String.fromCharCode("a".charCodeAt(0) + i),
            buildTree(size, depth - 1, iv * 10 + i + 1)
          ])
        )
      );

function time(op, ...args) {
  const start = process.hrtime.bigint();
  op(...args);
  return process.hrtime.bigint() - start;
}

const tree = buildTree(10, 4, 0);

function bm(desc, count, op) {
  const ns = time(op, count) / BigInt(count);
  console.log(`${desc}: ${ns} ns/op, ${1000000000n / ns} ops/s`);
}

bm(`First $..a[2].c`, 20000, count => {
  console.log(`Building trees`);
  const trees = _.range(count).map(i => buildTree(10, 4, i));
  console.log(`Running test`);
  for (const tree of trees) {
    const obj = jp.query(tree, "$..a[2].c", 1);
  }
});

bm(`Get   $..a[2].c`, 20000, count => {
  console.log(`Building trees`);
  const trees = _.range(count).map(i => buildTree(10, 4, i));
  console.log(`Running test`);
  for (const tree of trees) {
    const obj = jp.query(tree, "$..a[2].c");
  }
});
