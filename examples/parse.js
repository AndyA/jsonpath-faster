"use strict";

const esprima = require("esprima");
const estraverse = require("estraverse");
const escodegen = require("escodegen");

const { inspect } = require("../lib/util");

const exprs = [
  'lval.category=="fiction"',
  "lval.isbn",
  "lval.length-1",
  "lval.price<10",
  "lval.price==8.95",
  "lval.price",
  'lval.first["price"]'
  //  "foo.bar"
];

const safen = (ast, lval) => {
  const allow = {
    Program: true,
    ExpressionStatement: true,

    // Allowed in static-eval but denied here
    CallExpression: false,
    ReturnStatement: false,

    // Only access our lval
    MemberExpression: (node, parent) =>
      node.object &&
      (node.object.type === "MemberExpression" || node.object.name === lval),

    ArrayExpression: true,
    BinaryExpression: true,
    ConditionalExpression: true,
    Identifier: true,
    Literal: true,
    LogicalExpression: true,
    ObjectExpression: true,
    TaggedTemplateExpression: true,
    TemplateElement: true,
    TemplateLiteral: true,
    UnaryExpression: true
  };

  estraverse.traverse(ast, {
    enter(node, parent) {
      const rule = allow[node.type];
      if (!rule || (typeof rule === "function" && !rule(node, parent)))
        throw new Error(`Bad node: ${escodegen.generate(node)}`);
    }
  });
  return ast;
};

for (const expr of exprs) {
  const ast = esprima.parse(expr);
  console.log(inspect(ast));
  const safe = safen(ast, "lval");
  console.log(escodegen.generate(safe));
}
