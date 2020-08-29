"use strict";

const vivifyTokens = ast => {
  const _ = require("lodash");
  const { vivifyType, shouldVivify } = require("./viv-rules");
  const { isFork } = require("../tokens");

  const lookup = (comp, tok) => {
    for (const h of comp) if (h.when(tok)) return h.gen(tok);
  };

  const viv = ast => {
    if (!ast.length) return { next: [], vv: undefined, should: true };
    const [tok, ...tail] = ast;

    if (isFork(tok)) {
      const fork = tok.next.map(viv);
      const vivify = fork.some(f => f.should);
      const vvs = _.uniq(fork.map(f => f.vv));
      const vv = vvs.length === 1 && vvs[0];

      return {
        next: [
          {
            scope: "internal",
            operation: "fork",
            vivify,
            next: fork.map(f => f.next),
            pragmas: tok.pragmas
          }
        ],
        vv,
        should: vivify
      };
    }

    const { next, vv, should } = viv(tail);
    const vivify = should && lookup(shouldVivify, tok);

    return {
      next: [{ ...tok, vivify, vv }, ...next],
      vv: lookup(vivifyType, tok),
      should: vivify
    };
  };

  return viv(ast).next;
};

module.exports = { vivifyTokens };