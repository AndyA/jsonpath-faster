"use strict";

const Benchmark = require("benchmark");
const getWorkers = require("./lib/worker");
const csv = require("csv-stringify/lib/sync");

const spec = require("./spec");

const reporter = sendLine => {
  const cols = new Set();
  let needHeader = true;

  return res => {
    let tests;
    const rec = {};
    res.forEach(r => {
      const [col, path, method, count] = r.name.split(/\t/);
      cols.add(col);
      if (!tests) tests = [path, method, count];
      rec[col] = r;
    });

    if (needHeader) {
      sendLine(["path", "method", "count", ...cols]);
      needHeader = false;
    }

    sendLine([...tests, ...[...cols].map(col => rec[col].hz)]);
  };
};

async function bm(things, spec) {
  const { obj, paths, methods, counts } = spec;
  const workers = await getWorkers(things);
  const rep = reporter(row => process.stdout.write(csv([row])));

  for (const path of paths) {
    for (const method of methods) {
      for (const count of counts) {
        const suite = new Benchmark.Suite();

        const name = `${path}\t${method}\t${count === undefined ? "∞" : count}`;

        for (const w of workers) {
          suite.add(`${w.name}\t${name}`, function() {
            w.jp[method](obj, path, count);
          });
        }

        // add listeners
        suite
          .on("cycle", function(event) {
            console.error(`  ${event.target}`);
          })
          .on("complete", function() {
            rep(this);
          })
          .on("error", function(e) {
            console.error(e);
            process.exit(1);
          })
          .run();
      }
    }
  }
}

const defaultThings = ["jsonpath", "baseline", "HEAD"];

(async () => {
  try {
    let things = process.argv.slice(2);
    if (things.length === 0) things = defaultThings;
    await bm(things, spec);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
