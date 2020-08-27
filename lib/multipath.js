"use strict";

const jp = require("..");
const _ = require("lodash");
const genfun = require("generate-function");

const { makeTree, mergeTrees, renderTree } = require("./merge");
const { makeTerminal } = require("./tokens");
const { js, fun } = require("./util");

const idFactory = base => (next => () => `${base}${next++}`)(1);

class MultiPath {
  constructor() {
    this.tree = [];
    this.nextName = idFactory("action");
    this.actions = {};
    this.nextGroup = 0;
  }

  addTree(tree) {
    this.tree = mergeTrees(this.tree, makeTree(tree));
    return this;
  }

  render() {
    return renderTree(this.tree);
  }

  addAction(path, lastly) {
    return this.addTree([
      ...jp.parse(path),
      makeTerminal(lastly, this.nextGroup++)
    ]);
  }

  makeAction(action) {
    const name = this.nextName();
    this.actions[name] = fun(action);
    return name;
  }

  addVisitor(path, visitor) {
    const name = this.makeAction(visitor);
    return this.addAction(path, `${name}(@.value, @.path);`);
  }

  addMutator(path, mutator) {
    const name = this.makeAction(mutator);
    return this.addAction(path, `@.nvalue = ${name}(@.value, @.path);`);
  }

  addSetter(path, setter) {
    const name = this.makeAction(setter);
    return this.addAction(path, `@.value = ${name}(@.value, @.path);`);
  }

  code() {
    return [
      `function (obj, $) {`,
      jp.compiler.compile(this.render(), {}),
      `  return obj;`,
      `}`
    ].join("\n");
  }

  compile() {
    return genfun()(this.code()).toFunction(this.actions);
  }
}

module.exports = { MultiPath };
