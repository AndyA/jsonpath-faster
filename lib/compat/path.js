"use strict";

const genfun = require("generate-function");
const { makeTerminal } = require("../tokens");

// Provides a jsonpath interface for a given path

const makePath = (jp, path, pragmas) => {
  const { compiler } = jp;
  const ast = jp.parse(path);

  const compileMethod = (ctx, ...tok) => {
    const code = compiler.compile([...ast, ...tok], ctx);
    const gen = genfun();
    gen(`function(obj, count, extra, $) { ${code} }`);
    return gen.toFunction();
  };

  const makeMethod = (...tok) => {
    let counted, uncounted;

    return function(obj, count, $) {
      if (count !== undefined) {
        const m = (counted =
          counted || compileMethod({ counted: true }, ...tok));
        return m(obj, count, undefined, $);
      } else {
        const m = (uncounted =
          uncounted || compileMethod({ counted: false }, ...tok));
        return m(obj, count, undefined, $);
      }
    };
  };

  const makeGetSet = () => {
    let getter, setter;

    return function(obj, newValue, $) {
      if (newValue === undefined) {
        const m = (getter =
          getter ||
          compileMethod(
            { counted: true },
            makeTerminal(ctx => {
              ctx.preamble.push(`var value;`);
              ctx.appendix.push(`return value;`);
              return `value = @.value;`;
            }, pragmas)
          ));
        return m(obj, 1, newValue, $);
      } else {
        const m = (setter =
          setter ||
          compileMethod(
            { counted: true },
            makeTerminal(ctx => {
              ctx.appendix.push(`return extra;`);
              return `@.value = extra;`;
            }, pragmas)
          ));
        return m(obj, 1, newValue, $);
      }
    };
  };

  return {
    query: makeMethod(
      makeTerminal(ctx => {
        ctx.preamble.push(`var values = [];`);
        ctx.appendix.push(`return values;`);
        return `values.push(@.value);`;
      }, pragmas)
    ),

    paths: makeMethod(
      makeTerminal(ctx => {
        ctx.preamble.push(`var paths = [];`);
        ctx.appendix.push(`return paths;`);
        return `paths.push(@.path);`;
      }, pragmas)
    ),

    nodes: makeMethod(
      makeTerminal(ctx => {
        ctx.preamble.push(`var nodes = [];`);
        ctx.appendix.push(`return nodes;`);
        return `nodes.push({path: @.path, value: @.value});`;
      }, pragmas)
    ),

    value: makeGetSet(),

    parent(obj, $) {
      const m = compileMethod(
        { counted: true },
        makeTerminal(ctx => {
          ctx.preamble.push(`var value;`);
          ctx.appendix.push(`return value;`);
          return `value = @.parent;`;
        }, pragmas)
      );
      this.parent = (obj, $) => m(obj, 1, undefined, $);
      return this.parent(obj, $);
    },

    apply(obj, fn, $) {
      const m = compileMethod(
        {},
        makeTerminal(ctx => {
          ctx.preamble.push(`var nodes = [];`);
          ctx.appendix.push(`return nodes;`);
          const [r] = ctx.sym("r");
          return (
            `var ${r} = extra(@.value, @.path);` +
            `if (${r} !== undefined) @.value = ${r};` +
            `nodes.push({path: @.path, value: @.value});`
          );
        }, pragmas)
      );
      this.apply = (obj, fn, $) => m(obj, 0, fn, $);
      return this.apply(obj, fn, $);
    }
  };
};

module.exports = makePath;
