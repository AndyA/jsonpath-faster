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
    const expr = h.call(ctx, lhs);

    for (const slot of ["pre", "post"]) {
      if (!expr[slot]) continue;
      const gen = parse(_.castArray(expr[slot]).join("\n"));
      wrapper[slot].push(gen);
    }
    return getExpression(parse(expr.code));
  };

  const isAlias = node =>
    node.type === "MemberExpression" &&
    node.object &&
    node.object.type === "Identifier" &&
    node.object.name === alias &&
    node.property &&
    node.property.type === "Identifier";

  const parse = code => {
    const ast = esprima.parse(code.replace(/@/g, alias));

    // Stack of booleans indicating whether we're in the
    // LHS of an assignment.
    const stack = [];
    return estraverse.replace(ast, {
      enter(node, parent) {
        const isParent = (type, key) =>
          parent && parent.type === type && parent[key] === node;

        // Get the next value for the LHS stack. If this node is
        // an AssignmentExpression or an UpdateExpression and we're
        // the appropriate child of it push  true otherwise if we're
        // the object of a MemberExpression push a copy of TOS.
        const getLHSContext = () => {
          if (isParent("AssignmentExpression", "left")) return true;
          if (isParent("UpdateExpression", "argument")) return true;
          if (stack.length && isParent("MemberExpression", "object"))
            return _.last(stack);
          return false;
        };

        const isLHS = () => stack.length && _.last(stack);

        stack.push(getLHSContext());

        if (isAlias(node, alias)) return resolve(node.property.name, isLHS());

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

const makeScript = body => ({ sourceType: "script", type: "Program", body });

const bindLastly = (code, ctx) => {
  const alias = mkUniqueIdent(code, 20);

  const flatFrag = codes =>
    (codes.length &&
      reAt(
        escodegen.generate(makeScript(codes.flatMap(code => code.body))),
        alias
      )) ||
    "";

  const { pre, post, gen } = parseLastly(code, ctx, alias);

  return {
    pre: flatFrag(pre),
    post: flatFrag(post.slice(0).reverse()),
    code: reAt(escodegen.generate(gen), alias)
  };
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
