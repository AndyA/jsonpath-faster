"use strict";

const _ = require("lodash");

const { makeTree, mergeTrees, renderTree } = require("../lib/merge");

class Nest {
  constructor() {
    this.tree = [];
  }

  add(...asts) {
    for (const ast of _.flatten(asts)) mergeTrees(this.tree, makeTree(ast));
    return this;
  }

  render() {
    return renderTree(this.tree);
  }
}

module.exports = Nest;
