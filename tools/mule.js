"use strict";

const _ = require("lodash");
const esprima = require("esprima");
const estraverse = require("estraverse");
const escodegen = require("escodegen");
const inspect = require("../lib/inspect");

const ast = esprima.parse("foo.bar += 3");
console.log(inspect(ast));

const stack = [];
estraverse.traverse(ast, {
  enter(node, parent) {
    const isLHS = () => stack.length && _.last(stack);
    const isParent = (type, key) =>
      parent && parent.type === type && parent[key] === node;

    const getSetting = () => {
      if (isParent("AssignmentExpression", "left")) return true;
      if (isParent("UpdateExpression", "argument")) return true;
      if (stack.length && isParent("MemberExpression", "object"))
        return _.last(stack);
      return false;
    };

    stack.push(getSetting());

    if (node.type === "Identifier" && node.name === "foo") {
      console.log(isLHS());
    }
  },
  leave(node, parent) {
    stack.pop();
  }
});

//console.log(inspect(ast));
