"use strict";

const jp = require("..");
const _ = require("lodash");

const { makeTree, mergeTrees, renderTree } = require("./merge");
const { makeTerminal } = require("./tokens");

class Nest {
  constructor() {
    this.tree = [];
  }

  add(ast) {
    mergeTrees(this.tree, makeTree(ast));
    return this;
  }

  render() {
    return renderTree(this.tree);
  }
}

class MultiPath extends Nest {
  constructor() {
    super();
  }

  addAction(path, lastly) {
    return this.add([...jp.parse(path), makeTerminal(lastly)]);
  }
}

module.exports = { Nest, MultiPath };
