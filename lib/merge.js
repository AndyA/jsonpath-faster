"use strict";

const _ = require("lodash");

const { makeTokenMatcher } = require("./tokens");

const makeIntOpMatcher = operation =>
  makeTokenMatcher({ operation, scope: "internal" });

const isTerminal = makeIntOpMatcher("terminal");
const isFork = makeIntOpMatcher("fork");

// By this definition a terminal can never match itself
const isSame = (toka, tokb) =>
  !isTerminal(toka) && !isTerminal(tokb) && _.isEqual(toka, tokb);

// Merge ASTs. Assume the ASTs already have terminal nodes so that they will
// be distinct even if identical up to the terminal.
//
// Either / both AST may already contain forks.
//
// Returns an array of ASTs that have been merged as far as they can be.

const makeTree = ast => {
  const [tok, ...tail] = ast;
  if (isFork(tok)) return tok.next.map(n => makeTree(n));
  if (tail.length) return [{ tok, next: makeTree(tail) }];
  return [{ tok }];
};

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
