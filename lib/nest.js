"use strict";

const _ = require("lodash");
const genfun = require("generate-function");

const { makeTree, mergeTrees, renderTree } = require("./merge");
const { makeTerminal } = require("./tokens");
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

  const nest = (obj, $) => nest.compile()(obj, $);

  return Object.assign(nest, {
    addTree(ast) {
      tree = mergeTrees(tree, makeTree(ast));
      return this;
    },

    render() {
      return renderTree(tree);
    },

    at(path, lastly) {
      code = undefined;
      handler = undefined;
      return this.addTree([
        ...jp.parse(path),
        makeTerminal(lastly, nextGroup++)
      ]);
    },

    visitor(path, visitor) {
      const name = makeAction(visitor);
      return this.at(path, `${name}(@.value, @.path);`);
    },

    mutator(path, mutator) {
      const name = makeAction(mutator);
      return this.at(path, `@.nvalue = ${name}(@.value, @.path);`);
    },

    setter(path, setter) {
      const name = makeAction(setter);
      return this.at(path, `@.value = ${name}(@.value, @.path);`);
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
}

module.exports = { Nest };
