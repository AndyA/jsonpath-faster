"use strict";

const esprima = require("esprima");
const estraverse = require("estraverse");
const escodegen = require("escodegen");

const { inspect } = require("../lib/util");

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
const mkIdent = () => {
  const id = [];
  for (let i = 0; i < 5; i++)
    id.push(String.fromCharCode(Math.random() * 26 + 97));
  return id.join("");
};

const mkUniqueIdent = expr => {
  while (true) {
    const id = mkIdent();
    if (expr.indexOf(id) === -1) return id;
  }
};

const exprs = [
  //  '@.category=="fiction"',
  //  "@.isbn",
  //  "@.length-1",
  //  "@.price<10",
  //  "@.price==8.95",
  //  "@.price",
  '@.first["@price"]'
];

const lval = "obj[3].id";

for (const expr of exprs) {
  const lvar = mkUniqueIdent(expr + lval);
  const ast = esprima.parse(expr.replace(/@/g, lvar));
  console.log(inspect(ast));
  const safe = safen(ast, lvar);

  const lvAst = esprima.parse(lval);
  console.log(inspect(lvAst));
  const gen = estraverse.replace(safe, {
    enter: function(node) {
      if (node.type === "Identifier" && node.name === lvar)
        return lvAst.body[0].expression;
    }
  });

  const code = escodegen
    .generate(gen.body[0].expression)
    .replace(new RegExp(lvar, "g"), "@");

  console.log(code);
}
