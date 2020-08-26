"use strict";

const jp = require("..");
const _ = require("lodash");
const genfun = require("generate-function");

const { makeTree, mergeTrees, renderTree } = require("./merge");
const { makeTerminal } = require("./tokens");
const { js } = require("./util");

class Nest {
  constructor() {
    this.tree = [];
  }

  add(ast) {
    this.tree = mergeTrees(this.tree, makeTree(ast));
    return this;
  }

  render() {
    return renderTree(this.tree);
  }
}

const idFactory = base => (next => () => `${base}${next++}`)(1);

// TODO maybe order preservation should be a function of the compiler.
// That would mean it could apply to addAction too.

class MultiPath extends Nest {
  constructor() {
    super();

    this.nextName = idFactory("action");
    this.actions = {};
    this.nextGroup = 0;
  }

  addAction(path, lastly) {
    return this.add([
      ...jp.parse(path),
      makeTerminal(lastly, this.nextGroup++)
    ]);
  }

  makeAction(action) {
    const name = this.nextName();
    this.actions[name] = action;
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

  code() {
    return [
      `function (obj, $) {`,
      jp.compiler.compile(this.render(), {}),
      `}`
    ].join("\n");
  }

  compile() {
    return genfun()(this.code()).toFunction({ jp, ...this.actions });
  }
}

module.exports = { Nest, MultiPath };
