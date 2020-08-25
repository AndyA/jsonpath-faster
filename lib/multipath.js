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
    mergeTrees(this.tree, makeTree(ast));
    return this;
  }

  render() {
    return renderTree(this.tree);
  }
}

const idFactory = base => (next => () => `${base}${next++}`)(1);

class MultiPath extends Nest {
  constructor() {
    super();

    this.nextName = idFactory("action");
    this.actions = {};
    this.groups = [];
  }

  addAction(path, lastly) {
    return this.add([...jp.parse(path), makeTerminal(lastly)]);
  }

  makeAction(action) {
    const { groups, actions } = this;
    const name = this.nextName();

    const group = groups.length;
    groups.push([]);

    actions[name] = action;

    return { name, group, args: ["path"] };
  }

  addVisitor(path, visitor) {
    const { name, group, args } = this.makeAction(visitor);
    return this.addAction(
      path,
      ctx =>
        `groups[${group}].push(() => ${name}(${ctx.lval()}, ${args.join(
          ", "
        )}))`
    );
  }

  addMutator(path, mutator) {
    const { name, group, args } = this.makeAction(mutator);
    return this.addAction(
      path,
      ctx =>
        `groups[${group}].push(() => ${ctx.lval()} = ${name}(${ctx.lval()}, ${args.join(
          ", "
        )}))`
    );
  }

  code() {
    return [
      `function (obj, $) {`,
      `  var groups = ${js(this.groups)}`,
      jp.compiler.compile(this.render(), { trackPath: true }),
      `  for (var gi = 0; gi < groups.length; gi++) {`,
      `    var group = groups[gi];`,
      `    for (var gj = 0; gj < group.length; gj++) {`,
      `      group[gj]();`,
      `    }`,
      `  }`,
      `}`
    ].join("\n");
  }

  compile() {
    console.log(this.code());
    return genfun()(this.code()).toFunction(this.actions);
  }
}

module.exports = { Nest, MultiPath };
