"use strict";

const path = require("path");
const prettier = require("prettier");
const Benchmark = require("benchmark");

const { js } = require("../lib/util");

const getWorkers = require("../benchmark/lib/worker");
const spec = require("../benchmark/spec");

function runSuite(suite) {
  return suite
    .on("cycle", function(event) {
      console.log(`//  ${event.target}`);
    })
    .on("complete", function() {
      console.log("// Fastest is " + this.filter("fastest").map("name"));
    })
    .on("error", function(e) {
      console.error(e);
      process.exit(1);
    })
    .run();
}

async function snoop(what, jpath, method, count, opt) {
  const workers = await getWorkers(what);
  const suite = new Benchmark.Suite();

  for (const worker of workers) {
    if (!opt.has("s")) {
      if (worker.dir) {
        const engine = worker.jp.compiler;
        const Cache = require(path.join("..", worker.dir, "lib/compat/cache"));

        const snoopEngine = {
          ...engine,
          compile(ast, ctx) {
            // Support legacy compileTokens
            const code = engine.compileTokens
              ? engine.compileTokens(ast, ctx)
              : engine.compile(ast, ctx);

            const pretty = prettier.format(
              `// ${worker.name} ${jpath} ${method} count: ${
                count === undefined ? "∞" : count
              }\n\n` +
                `const ast = ${js(ast)};\n\n` +
                `const ctx = ${js(ctx)};\n\n` +
                `module.exports = function(obj, count, extra, $) { ${code} }`,
              { filepath: "code.js" }
            );
            console.log(pretty);
            return code;
          }
        };

        const jp = new Cache(snoopEngine);
        const res = jp[method](spec.obj, jpath, count);
      } else {
        console.log(`// Can't snoop on ${worker.name}`);
      }
    }

    if (opt.has("b")) {
      const jpt = worker.jp;
      const obj = spec.obj;
      suite.add(`${worker.name} ${jpath}`, function() {
        jpt[method](obj, jpath, count);
      });
    }
  }

  if (opt.has("b")) {
    console.log(`// Benchmark`);
    runSuite(suite);
  }
}

function parseArgs(args) {
  const switches = new Set();
  const pos = [];
  for (const arg of args) {
    if (/^-\w/.test(arg))
      for (const s of arg.substr(1).split("")) switches.add(s);
    else pos.push(arg);
  }
  return { pos, switches };
}

(async () => {
  try {
    const args = parseArgs(process.argv.slice(2));

    if (args.pos.length < 3 || args.pos.length > 4) {
      console.error(
        `Syntax: ${process.argv[1]} [-b] [-s] <what> <jpath> <method> [<count>]`
      );
      process.exit(1);
    }

    const [what, jpath, method, count] = args.pos;
    await snoop(what.split(/,/), jpath, method, count, args.switches);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
