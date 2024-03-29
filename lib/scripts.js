"use strict";

const esprima = require("esprima");
const estraverse = require("estraverse");
const escodegen = require("escodegen");
const { mkUniqueIdent } = require("./ident");

const reAt = (code, lval) => code.replace(new RegExp(lval, "g"), "@");

const allow = {
  Program: true,

  ExpressionStatement: (node, parent, lval) =>
    node.expression.type !== "Identifier" ||
    node.expression.name === lval ||
    node.expression.name === "$",

  // Allowed in static-eval but denied here
  ReturnStatement: false,

  // Only access our lval
  MemberExpression: (node, parent, lval) =>
    node.object &&
    (node.object.type === "MemberExpression" ||
      node.object.name === lval ||
      node.object.name === "$"),

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
  UnaryExpression: true,
};

const safen = (ast, lval, allow) => {
  estraverse.traverse(ast, {
    enter(node, parent) {
      const rule = allow[node.type];
      const ok = typeof rule === "function" ? rule(node, parent, lval) : !!rule;
      if (!ok) {
        throw new Error(
          `Bad node ${node.type}: ${reAt(escodegen.generate(node), lval)}`
        );
      }
    },
  });
  return ast;
};

const bindScript = (expr, lval) => {
  // Make an alias for @ that's guaranteed not to appear in
  // the expression or lval
  const alias = mkUniqueIdent(expr + lval);

  // Parse the expression with @ -> alias
  const ast = esprima.parse(expr.replace(/@/g, alias));

  // Make it safe (we hope)
  const safe = safen(ast, alias, allow);

  // Get the AST for the lval.
  const lv = esprima.parse(lval);

  // Replace the alias with lval
  const gen = estraverse.replace(safe, {
    enter: function (node) {
      if (node.type === "Identifier" && node.name === alias)
        return lv.body[0].expression;
    },
  });

  // Hmm...
  const code = gen.body && gen.body[0] && gen.body[0].expression;
  if (!code) throw new Error(`No code in ${expr}`);

  // Emit code, replacing any remaining aliases
  // with "@"
  return reAt(escodegen.generate(code), alias);
};

const bindFilter = (expr, lval) => {
  const m = expr.match(/^\?\((.*)\)$/);
  if (!m) throw new Error(`Can't parse filter ${expr}`);
  return bindScript(m[1], lval);
};

module.exports = { bindScript, bindFilter };
