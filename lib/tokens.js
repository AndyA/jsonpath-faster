"use strict";

const _ = require("lodash");
const { fun } = require("./util");

const makeTokenMatcher = test => {
  if (typeof test === "function") return test;

  const match = (obj, test) => {
    if (obj === undefined) return false;
    if (Array.isArray(test)) return test.some(test => match(obj, test));
    if (typeof test === "function") return test(obj);
    if (typeof obj === "string") return test === obj;
    for (const prop in test) if (!match(obj[prop], test[prop])) return false;
    return true;
  };

  return tok => match(tok, test);
};

const makeIntOpMatcher = operation =>
  makeTokenMatcher({ operation, scope: "internal" });

const makeLadder = rungs =>
  rungs.map(({ when, ...rest }) => ({
    when: makeTokenMatcher(when),
    ...rest,
  }));

const root = {
  expression: { type: "root", value: "$" },
};

const isRoot = makeTokenMatcher(root);

const normalise = ast => (isRoot(ast[0]) && ast) || [root, ...ast];

const makeTerminal = (lastly, pragmas, group) => ({
  scope: "internal",
  operation: "terminal",
  lastly: fun(lastly),
  pragmas,
  group,
});

const isTerminal = makeIntOpMatcher("terminal");
const isFork = makeIntOpMatcher("fork");

// By this definition a terminal can never match itself
const isSame = (toka, tokb) =>
  !isTerminal(toka) && !isTerminal(tokb) && _.isEqual(toka, tokb);

const stripRoot = ast => (isRoot(ast[0]) ? ast.slice(1) : ast);

const prefix = (ast, prefix) => [...normalise(prefix), ...stripRoot(ast)];

module.exports = {
  makeTokenMatcher,
  makeIntOpMatcher,
  makeLadder,
  normalise,
  stripRoot,
  prefix,
  makeTerminal,
  isRoot,
  isTerminal,
  isFork,
  isSame,
};
