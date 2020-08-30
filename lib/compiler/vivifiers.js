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
      const pragmas = {
        unordered: fork.every(
          f => f.next[0] && f.next[0].pragmas && f.next[0].pragmas.unordered
        )
      };

      return {
        next: [
          {
            scope: "internal",
            operation: "fork",
            vivify,
            next: fork.map(f => f.next),
            pragmas
          }
        ],
        vv,
        should: vivify
      };
    }

    const { next, vv, should } = viv(tail);
    const vivify = should && lookup(shouldVivify, tok);
    const pragmas = tok.pragmas || (next[0] && next[0].pragmas);

    return {
      next: [{ ...tok, vivify, vv, pragmas }, ...next],
      vv: lookup(vivifyType, tok),
      should: vivify
    };
  };

  return viv(ast).next;
};

module.exports = { vivifyTokens };
