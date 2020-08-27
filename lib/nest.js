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

  return {
    addTree(ast) {
      tree = mergeTrees(tree, makeTree(ast));
      return this;
    },

    render() {
      return renderTree(tree);
    },

    addAction(path, lastly) {
      return this.addTree([
        ...jp.parse(path),
        makeTerminal(lastly, nextGroup++)
      ]);
    },

    makeAction(action) {
      const name = nextName();
      actions[name] = fun(action);
      return name;
    },

    addVisitor(path, visitor) {
      const name = this.makeAction(visitor);
      return this.addAction(path, `${name}(@.value, @.path);`);
    },

    addMutator(path, mutator) {
      const name = this.makeAction(mutator);
      return this.addAction(path, `@.nvalue = ${name}(@.value, @.path);`);
    },

    addSetter(path, setter) {
      const name = this.makeAction(setter);
      return this.addAction(path, `@.value = ${name}(@.value, @.path);`);
    },

    code() {
      return [
        `function (obj, $) {`,
        jp.compiler.compile(this.render(), {}),
        `  return obj;`,
        `}`
      ].join("\n");
    },

    compile() {
      return genfun()(this.code()).toFunction(actions);
    }
  };
}

module.exports = { Nest };
