"use strict";

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

const makeLadder = rungs =>
  rungs.map(({ when, ...rest }) => ({
    when: makeTokenMatcher(when),
    ...rest
  }));

module.exports = { makeTokenMatcher, makeLadder };
