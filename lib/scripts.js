"use strict";

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

const bindScript = (expr, lval) =>
  codeReplace(expr, s => s.replace(/@/g, lval));

const bindFilter = (expr, lval) => {
  const m = expr.match(/^\?\((.*)\)$/);
  if (!m) throw new Error(`Can't parse filter ${expr}`);
  return bindScript(m[1], lval);
};

module.exports = { bindScript, bindFilter };
