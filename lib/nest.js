"use strict";

const _ = require("lodash");
const genfun = require("generate-function");

const { makeTree, mergeTrees, renderTree } = require("./merge");
const { makeTerminal } = require("./tokens");
const addPragmas = require("./pragmas");
const { js, fun } = require("./util");

const idFactory = base => (next => () => `${base}${next++}`)(1);

function Nest(jp) {
  let tree = [];
  const nextName = idFactory("action");
  const actions = {};
  let nextGroup = 0;

  const makeAction = action => {
    const name = nextName();
    actions[name] = fun(action);
    return name;
  };

  let code, handler;

  const construct = proto => {
    const nest = (obj, $) => nest.compile()(obj, $);

    return Object.assign(nest, {
      action(path, stub, cb) {
        return nest.at(
          path,
          stub(makeAction(cb), cb.length < 2 ? `@.value` : `@.value, @.path`)
        );
      },

      addTree(ast) {
        tree = mergeTrees(tree, makeTree(ast));
        return nest;
      },

      render() {
        return renderTree(tree);
      },

      at(path, lastly) {
        code = undefined;
        handler = undefined;
        return this.addTree([
          ...jp.parse(path),
          makeTerminal(lastly, this.pragmas, nextGroup++)
        ]);
      },

      visitor(path, vis) {
        return this.action(path, (cb, args) => `${cb}(${args});`, vis);
      },

      mutator(path, mut) {
        return this.action(
          path,
          (cb, args) => `@.nvalue = ${cb}(${args});`,
          mut
        );
      },

      setter(path, set) {
        return this.action(
          path,
          (cb, args) => `@.value = ${cb}(${args});`,
          set
        );
      },

      code() {
        return (code =
          code ||
          [
            `function (obj, $) {`,
            jp.compiler.compile(this.render(), {}),
            `  return obj;`,
            `}`
          ].join("\n"));
      },

      compile() {
        return (handler = handler || genfun()(this.code()).toFunction(actions));
      }
    });
  };

  return addPragmas(construct({}), ["leaf", "interior", "string"], obj =>
    construct(obj)
  );
}

module.exports = { Nest };
