"use strict";

const mkIdent = (len = 5) => {
  const id = [];
  for (let i = 0; i < len; i++)
    id.push(String.fromCharCode(Math.random() * 26 + 97));
  return id.join("");
};

const mkUniqueIdent = (expr, len = 5) => {
  while (true) {
    const id = mkIdent(len);
    /* istanbul ignore next */
    if (expr.indexOf(id) === -1) return id;
  }
};

module.exports = { mkIdent, mkUniqueIdent };
