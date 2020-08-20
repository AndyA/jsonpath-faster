"use strict";

const path = require("path");

const Benchmark = require("benchmark");
const Checkout = require("./lib/checkout");

const spec = require("./spec");

const whatName = what => (/^[0-9a-f]+$/.test(what) ? what.substr(0, 7) : what);

async function getWorkers(things) {
  const co = new Checkout();

  const workers = await Promise.all(
    things.map(async what => {
      if (what === "HEAD") return { what, dir: ".", jp: require("..") };
      if (what === "jsonpath") return { what, jp: require("jsonpath") };

      const dir = await co.checkout(what);
      const jp = require(path.join("..", dir));

      return { what, dir, jp };
    })
  );

  return workers.map(w => ({ ...w, name: whatName(w.what) }));
}

const reporter = sendLine => {
  const cols = new Set();
  let needHeader = true;

  return res => {
    let tests;
    const rec = {};
    res.forEach(r => {
      const [col, path, method, count] = r.name.split(/\s+/);
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
  const rep = reporter(row => console.log(row.map(c => `"${c}"`).join(",")));

  for (const path of paths) {
    for (const method of methods) {
      for (const count of counts) {
        const suite = new Benchmark.Suite();

        const name = `${path} ${method} ${count === undefined ? "∞" : count}`;

        for (const w of workers) {
          suite.add(`${w.name} ${name}`, function() {
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

const things = ["jsonpath", "baseline", "HEAD"];

(async () => {
  try {
    await bm(things, spec);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
