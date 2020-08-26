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

  const resolve = propName => {
    const h = ctx[propName];
    if (h === undefined) throw Error(`Context has no ${propName}`);
    const expr = h();

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

    return estraverse.replace(ast, {
      enter: function(node) {
        if (
          node.type === "MemberExpression" &&
          node.object &&
          node.object.type === "Identifier" &&
          node.object.name === alias &&
          node.property &&
          node.property.type === "Identifier"
        ) {
          return resolve(node.property.name);
        }

        if (node.type === "Identifier" && node.name === alias)
          throw new Error(`No direct access to context`);
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
    _.reverse(post).map(p => p.body)
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
