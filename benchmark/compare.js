"use strict";

const Benchmark = require("benchmark");
const getWorkers = require("./lib/worker");

const spec = require("./spec");

const csv = row => row.map(x => (isNaN(x) ? `"${x}"` : x)).join(",");

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
  const sheet = [];
  const rep = reporter(row => sheet.push(csv(row)));

  let seen = 0;
  const discard = obj => seen++;

  for (const path of paths) {
    for (const method of methods) {
      for (const count of counts) {
        const suite = new Benchmark.Suite();

        const name = `${path}\t${method}\t${count === undefined ? "∞" : count}`;

        for (const w of workers) {
          suite.add(`${w.name}\t${name}`, function () {
            discard(w.jp[method](obj, path, count));
          });
        }

        // add listeners
        suite
          .on("cycle", function (event) {
            console.error(`  ${event.target}`);
          })
          .on("complete", function () {
            rep(this);
          })
          .on("error", function (e) {
            console.error(e);
            process.exit(1);
          })
          .run();
      }
    }
  }

  console.log(sheet.join("\n"));
}

const defaultArgs = ["jsonpath", "baseline", "HEAD"];

(async args => {
  try {
    await bm(args.length === 0 ? defaultArgs : args, spec);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})(process.argv.slice(2));
