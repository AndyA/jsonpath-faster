"use strict";

const _ = require("lodash");

const { isFork, isSame } = require("./tokens");

const isTree = astOrTree =>
  _.isArray(astOrTree) && astOrTree.length && _.isObject(astOrTree[0].tok);

const astToTree = ast => {
  const [tok, ...tail] = ast;
  if (isFork(tok)) return _.flatten(tok.next.map(n => astToTree(n)));
  if (tail.length) return [{ tok, next: astToTree(tail) }];
  return [{ tok }];
};

const makeTree = astOrTree =>
  isTree(astOrTree) ? astOrTree : astToTree(astOrTree);

const mergeTrees = (a, b) => {
  const mergeToken = tb => {
    for (const ta of a)
      if (isSame(ta.tok, tb.tok))
        return (ta.next = mergeTrees(ta.next, tb.next));
    a.push(tb);
  };

  for (const tb of b) mergeToken(tb);
  return a;
};

const renderTree = tree => {
  if (!tree) return [];

  if (tree.length === 1) {
    const { tok, next } = tree[0];
    return [tok, ...renderTree(next)];
  }

  return [
    {
      scope: "internal",
      operation: "fork",
      next: tree.map(t => renderTree([t]))
    }
  ];
};

module.exports = { makeTree, mergeTrees, renderTree };
