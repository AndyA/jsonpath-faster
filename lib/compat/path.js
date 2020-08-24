"use strict";

const jp = require("jsonpath");
const genfun = require("generate-function");
const { isObject } = require("../util");
const { makeTerminal } = require("../tokens");

// Provides a jsonpath interface for a given path

const makePath = (compiler, path) => {
  const ast = jp.parse(path);

  const compileMethod = (ctx, ...tok) => {
    const code = compiler.compileTokens([...ast, ...tok], ctx);
    const gen = genfun();
    gen(`function(obj, count, extra) { ${code} }`);
    const f = gen.toFunction();
    return f;
  };

  const makeMethod = (ctx, ...tok) => {
    let counted, uncounted;

    return function(obj, count) {
      if (count !== undefined) {
        const m = (counted =
          counted || compileMethod({ ...ctx, counted: true }, ...tok));
        return m(obj, count);
      } else {
        const m = (uncounted =
          uncounted || compileMethod({ ...ctx, counted: false }, ...tok));
        return m(obj);
      }
    };
  };

  const makeGetSet = () => {
    let getter, setter;

    return function(obj, newValue) {
      if (newValue === undefined) {
        const m = (getter =
          getter ||
          compileMethod(
            { trackPath: false, counted: true },
            makeTerminal(ctx => {
              ctx.preamble.push(`var value;`);
              ctx.appendix.push(`return value;`);
              return `value = ${ctx.lval};`;
            })
          ));
        return m(obj, 1);
      } else {
        const m = (setter =
          setter ||
          compileMethod(
            { trackPath: false, counted: true, vivify: true },
            makeTerminal(ctx => {
              ctx.appendix.push(`return extra;`);
              return `${ctx.lval} = extra;`;
            })
          ));
        return m(obj, 1, newValue);
      }
    };
  };

  return {
    query: makeMethod(
      { trackPath: false },
      makeTerminal(ctx => {
        ctx.preamble.push(`var values = [];`);
        ctx.appendix.push(`return values;`);
        return `values.push(${ctx.lval});`;
      })
    ),

    paths: makeMethod(
      { trackPath: true },
      makeTerminal(ctx => {
        ctx.preamble.push(`var paths = [];`);
        ctx.appendix.push(`return paths;`);
        return `paths.push(path);`;
      })
    ),

    nodes: makeMethod(
      { trackPath: true },
      makeTerminal(ctx => {
        ctx.preamble.push(`var nodes = [];`);
        ctx.appendix.push(`return nodes;`);
        return `nodes.push({path, value: ${ctx.lval}});`;
      })
    ),

    value: makeGetSet(),

    parent(obj) {
      this.parent = compileMethod(
        {},
        makeTerminal(ctx => {
          ctx.preamble.push(`var value;`);
          ctx.appendix.push(`return value;`);
          return `value = ${ctx.plval};`;
        })
      );
      return this.parent(obj);
    },

    apply(obj, fn) {
      const m = compileMethod(
        { trackPath: true },
        makeTerminal(ctx => {
          ctx.preamble.push(`var nodes = [];`);
          ctx.appendix.push(`return nodes;`);
          return (
            `${ctx.lval} = extra(${ctx.lval});` +
            `nodes.push({path, value: ${ctx.lval}});`
          );
        })
      );
      this.apply = (obj, fn) => m(obj, 0, fn);
      return this.apply(obj, fn);
    }
  };
};

module.exports = makePath;
