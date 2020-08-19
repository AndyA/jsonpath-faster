"use strict";

const jp = require("jsonpath");
const genfun = require("generate-function");

// Provides a jsonpath interface for a given path

const makePath = (compiler, path) => {
  const ast = jp.parse(path);

  const compileMethod = ctx => {
    const code = compiler.compileTokens(ast, ctx);
    const gen = genfun();
    gen(`function(obj, count, extra) { ${code} }`);
    const f = gen.toFunction();
    return f;
  };

  const makeMethod = ctx => {
    let counted, uncounted;

    return function(obj, count) {
      if (count !== undefined) {
        const m = (counted =
          counted || compileMethod({ ...ctx, counted: true }));
        return m(obj, count);
      } else {
        const m = (uncounted =
          uncounted || compileMethod({ ...ctx, counted: false }));
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
          compileMethod({
            trackPath: false,
            counted: true,
            lastly: ctx => {
              ctx.preamble.push(`let value;`);
              ctx.appendix.push(`return value;`);
              return `value = ${ctx.lval};`;
            }
          }));
        return m(obj, 1);
      } else {
        const m = (setter =
          setter ||
          compileMethod({
            trackPath: false,
            counted: true,
            vivify: true,
            lastly: ctx => {
              ctx.appendix.push(`return extra;`);
              return `${ctx.lval} = extra;`;
            }
          }));
        return m(obj, 1, newValue);
      }
    };
  };

  return {
    query: makeMethod({
      trackPath: false,
      lastly: ctx => {
        ctx.preamble.push(`const values = [];`);
        ctx.appendix.push(`return values;`);
        return `values.push(${ctx.lval});`;
      }
    }),

    paths: makeMethod({
      trackPath: true,
      lastly: ctx => {
        ctx.preamble.push(`const paths = [];`);
        ctx.appendix.push(`return paths;`);
        return `paths.push(path);`;
      }
    }),

    nodes: makeMethod({
      trackPath: true,
      lastly: ctx => {
        ctx.preamble.push(`const nodes = [];`);
        ctx.appendix.push(`return nodes;`);
        return `nodes.push({path, value: ${ctx.lval}});`;
      }
    }),

    value: makeGetSet(),

    parent(obj) {
      this.parent = compileMethod({
        lastly: ctx => {
          ctx.preamble.push(`let value;`);
          ctx.appendix.push(`return value;`);
          return `value = ${ctx.plval};`;
        }
      });
      return this.parent(obj);
    },

    apply(obj, fn) {
      const m = compileMethod({
        trackPath: true,
        lastly: ctx => {
          ctx.preamble.push(`const nodes = [];`);
          ctx.appendix.push(`return nodes;`);
          return (
            `${ctx.lval} = extra(${ctx.lval});` +
            `nodes.push({path, value: ${ctx.lval}});`
          );
        }
      });
      this.apply = (obj, fn) => m(obj, 0, fn);
      return this.apply(obj, fn);
    }
  };
};

module.exports = makePath;
