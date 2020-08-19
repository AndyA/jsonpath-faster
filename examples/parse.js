"use strict";

const { inspect } = require("../lib/util");
//const esprima = require("esprima");

//const expr = "x.length < 2";
//const ast = esprima.parse(expr);
//console.log(inspect(ast));

const hideLiterals = str => {
  const toks = str.split(/(\\.|\$\{|[}"'`])/);
  const nesters = new Set(["`", "'", '"', "}"]);
  const st = [];
  const struct = [];

  const getPair = (tok, tos) => {
    // Pretend ${ and } are quotes (} and }) that
    // may only nest in a template string
    if (tok == "${" || tok == "}") {
      if (tok === "${" && tos === "`") return "}";
      if (tos !== tok) return;
    }
    return tok;
  };

  for (const tok of toks) {
    const tos = st[st.length - 1];
    const pair = getPair(tok, tos);

    if (nesters.has(pair)) {
      if (tos === pair) {
        struct.push([tok, st.length, false]);
        st.pop();
        continue;
      } else st.push(pair);
    }

    struct.push([tok, st.length, st.length === 0 || tos === "}"]);
  }

  const runs = [];
  for (const chunk of struct) {
    const prev = runs[runs.length - 1];
    if (prev && prev[2] === chunk[2]) prev[0] = prev[0] + chunk[0];
    else runs.push(chunk);
  }

  return runs.map(r => r[0]);
};

const codeReplace = (str, mapper) => {
  const parts = hideLiterals(str);
  const out = [];
  while (parts.length) {
    out.push(mapper(parts.shift()));
    if (parts.length) out.push(parts.shift());
  }
  return out.join("");
};

const strs = [
  `Jello`,
  `Single 'Quotes'`,
  `Double "Quotes"`,
  `Backwhacked \\"Quotes\\" @`,
  "Template: `Boo`",
  "Nested template: `Boo ${x.map(i => `[${i}]`).join('@')}`",
  "Interp outsite template '${ @.safe }' `${ @.safe }` Phew!"
];

for (const str of strs) {
  console.log(str);
  const x = codeReplace(str, s => s.replace(/@/g, "lval"));
  console.log(inspect(x));
}
