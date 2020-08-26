"use strict";

const _ = require("lodash");
const esprima = require("esprima");
const estraverse = require("estraverse");
const escodegen = require("escodegen");

const { mkUniqueIdent } = require("./scripts");

const reAt = (code, lval) => code.replace(new RegExp(lval, "g"), "@");

const getExpression = ast =>
  ast && ast.body && ast.body[0] && ast.body[0].expression;

// TODO track LHS use of expression so that we can
//   * veto them
//   * decide whether to enable vivification

const parseLastly = (code, ctx, alias) => {
  const wrapper = { pre: [], post: [] };

  const resolve = (propName, lhs) => {
    const h = ctx[propName];
    if (h === undefined) throw Error(`Context has no ${propName}`);
    const expr = h(lhs);

    for (const slot of ["pre", "post"]) {
      if (!expr[slot]) continue;
      const gen = parse(_.castArray(expr[slot]).join("\n"));
      wrapper[slot].push(gen);
    }
    return getExpression(parse(expr.code));
  };

  const parse = code => {
    // Parse the expression with @ -> alias
    //    console.log(`parse ${code}`);
    const ast = esprima.parse(code.replace(/@/g, alias));

    const stack = [];
    return estraverse.replace(ast, {
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

        if (
          node.type === "MemberExpression" &&
          node.object &&
          node.object.type === "Identifier" &&
          node.object.name === alias &&
          node.property &&
          node.property.type === "Identifier"
        ) {
          return resolve(node.property.name, isLHS());
        }

        if (node.type === "Identifier" && node.name === alias)
          throw new Error(`No direct access to context`);
      },
      leave(node, parent) {
        stack.pop();
      }
    });
  };

  const gen = parse(code);

  return { ...wrapper, gen };
};

const bindLastly = (code, ctx) => {
  const alias = mkUniqueIdent(code, 20);
  const { pre, post, gen } = parseLastly(code, ctx, alias);

  const body = _.flattenDeep([
    pre.map(p => p.body),
    gen.body,
    post
      .slice(0)
      .reverse()
      .map(p => p.body)
  ]);

  const frag = { body, sourceType: "script", type: "Program" };
  return reAt(escodegen.generate(frag), alias);
};

const bindFactory = ctx => {
  const cache = {};
  return (name, maker) => {
    if (cache[name]) return { code: cache[name] };
    const [v] = ctx.sym(`_${name}`);
    cache[name] = v;
    return { pre: maker(v), code: v };
  };
};

module.exports = { bindLastly, bindFactory };
