"use strict";

const path = require("path");
const prettier = require("prettier");
const { js, inspect } = require("../lib/util");

const getWorkers = require("./lib/worker");
const spec = require("./spec");

const things = ["jsonpath", "baseline", "HEAD"];

async function snoop(what, jpath, method, count) {
  const workers = await getWorkers(what);
  for (const worker of workers) {
    if (!worker.dir) {
      console.log(`// Can't snoop on ${worker.name}`);
      continue;
    }
    const engine = require(path.join("..", worker.dir, "lib/engine"));
    const Cache = require(path.join("..", worker.dir, "lib/compat/cache"));

    const snoopEngine = {
      ...engine,
      compileTokens(ast, ctx) {
        const code = engine.compileTokens(ast, ctx);
        const pretty = prettier.format(
          `// ${worker.name} ${jpath} ${method} count: ${
            count === undefined ? "∞" : count
          }\n\n` +
            `const ast = ${js(ast)};\n\n` +
            `const ctx = ${js(ctx)};\n\n` +
            `module.exports = function(obj, count, extra) { ${code} }`,
          { filepath: "code.js" }
        );
        console.log(pretty);
        return code;
      }
    };

    const jp = new Cache(snoopEngine);
    const res = jp[method](spec.obj, jpath, count);
  }
}

(async () => {
  try {
    const args = process.argv.slice(2);

    if (args.length < 3 || args.length > 4) {
      console.error(
        `Syntax: ${process.argv[1]} <what> <jpath> <method> [<count>]`
      );
      process.exit(1);
    }

    const [what, jpath, method, count] = args;
    await snoop(what.split(/,/), jpath, method, count);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
