"use strict";

const nestedLiterals = str => {
  const toks = str.split(/(\n|\\.|\$\{|\/\/|\/\*|\*\/|[}"'`])/);
  const st = [];
  const out = [];

  for (const tok of toks) {
    const tos = st[st.length - 1];
    const inCode = st.length === 0 || tos === "}";

    if (inCode && /["'`]/.test(tok)) {
      st.push(tok);
      out.push([tok, st.length, false]);
    } else if (inCode && tok === "//") {
      st.push("\n");
      out.push([tok, st.length, false]);
    } else if (inCode && tok === "/*") {
      st.push("*/");
      out.push([tok, st.length, false]);
    } else if (tok === "${" && tos === "`") {
      st.push("}");
      out.push([tok, st.length, false]);
    } else if (tok === tos) {
      out.push([tok, st.length, false]);
      st.pop();
    } else if (tok.length) {
      out.push([tok, st.length, inCode]);
    }
  }

  return mergeLiterals(
    out,
    (prev, chunk) => prev[1] === chunk[1] && prev[2] === chunk[2]
  );
};

const mergeLiterals = (struct, pred) => {
  const runs = [];
  for (const chunk of struct) {
    const prev = runs[runs.length - 1];
    if (prev && pred(prev, chunk)) prev[0] = prev[0] + chunk[0];
    else runs.push(chunk);
  }

  return runs;
};

module.exports = { nestedLiterals, mergeLiterals };
