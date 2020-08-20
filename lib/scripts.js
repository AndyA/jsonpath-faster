"use strict";

const esprima = require("esprima");
const estraverse = require("estraverse");
const escodegen = require("escodegen");

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
        throw new Error(`Bad node ${node.type}: ${escodegen.generate(node)}`);
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

const bindScript = (expr, lval) => {
  // Make an alias for @ that's guaranteed not to appear in
  // the expression or lval
  const lvar = mkUniqueIdent(expr + lval);

  // Parse the expression with @ -> lvar
  const ast = esprima.parse(expr.replace(/@/g, lvar));

  // Make it safe (we hope)
  const safe = safen(ast, lvar);

  // Get the AST for the lval.
  const lv = esprima.parse(lval);

  // Replace the alias with lval
  const gen = estraverse.replace(safe, {
    enter: function(node) {
      if (node.type === "Identifier" && node.name === lvar)
        return lv.body[0].expression;
    }
  });

  // Emit code, replacing any remaining lvar aliases
  // with "@"
  return escodegen
    .generate(gen.body[0].expression)
    .replace(new RegExp(lvar, "g"), "@");
};

const bindFilter = (expr, lval) => {
  const m = expr.match(/^\?\((.*)\)$/);
  if (!m) throw new Error(`Can't parse filter ${expr}`);
  return bindScript(m[1], lval);
};

module.exports = { bindScript, bindFilter };
