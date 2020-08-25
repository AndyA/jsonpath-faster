"use strict";

const _ = require("lodash");
const esprima = require("esprima");
const estraverse = require("estraverse");
const escodegen = require("escodegen");

const inspect = require("./inspect");

const reAt = (code, lval) => code.replace(new RegExp(lval, "g"), "@");

const { mkUniqueIdent } = require("./scripts");

const getExpression = ast =>
  ast && ast.body && ast.body[0] && ast.body[0].expression;

const resolveExpression = expr => {
  if (!_.isString(expr)) return expr;
  return getExpression(esprima.parse(expr));
};

const bindLastly = (code, ctx) => {
  // TODO can't 100% guarantee no collision with ctx expansions
  // but 20 random characters == 26 ** 20 combinations so...
  const alias = mkUniqueIdent(code, 20);

  // Parse the expression with @ -> alias
  const ast = esprima.parse(code.replace(/@/g, alias));

  const gen = estraverse.replace(ast, {
    enter: function(node) {
      if (
        node.type === "MemberExpression" &&
        node.object &&
        node.object.type === "Identifier" &&
        node.object.name === alias &&
        node.property &&
        node.property.type === "Identifier"
      ) {
        const h = ctx[node.property.name];
        if (h === undefined)
          throw Error(`Context has no ${node.property.name}`);
        const frag = typeof h === "function" ? h() : h;
        return resolveExpression(bindLastly(frag, ctx));
      }

      if (node.type === "Identifier" && node.name === alias)
        throw new Error(`No direct access to context`);
    }
  });

  // Emit code, replacing any remaining aliases
  // with "@"
  return reAt(escodegen.generate(getExpression(gen)), alias);
};

module.exports = { bindLastly };
