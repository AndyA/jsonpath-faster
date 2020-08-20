"use strict";

const genfun = require("generate-function");

const parseSlice = slice => {
  const parts = slice.split(":");

  const norm = (...parts) => {
    if (parts.length < 2) return norm(0, ...parts);
    if (parts.length < 3) return norm(...parts, 1);
    if (parts.length > 3)
      throw new Error(`Too many components in slice: ${slice}`);
    return parts;
  };

  return norm(...parts).map((v, i) => {
    if (v === "") return null;
    if (isNaN(v)) throw new Error(`Non-numeric element in slice ${slice}`);
    return Number(v);
  });
};

const renderSlice = (ctx, start = null, end = null, step = null) => {
  if (step === 0) throw new Error(`Step may not be 0`);

  return (lval, block) => {
    const code = [];
    const len = `${lval}.length`;

    const low = (v, sym, lim) => {
      if (v === null) return lim;
      if (v < 0) {
        const [vv] = ctx.sym(sym);
        code.push(`var ${vv} = Math.max(${len}${v}, ${lim});`);
        return vv;
      }
      return v;
    };

    const high = (v, sym, lim) => {
      if (v === null) return lim;
      const [vv] = ctx.sym(sym);
      if (v < 0) code.push(`var ${vv} = Math.max(0, ${len}${v});`);
      else code.push(`var ${vv} = Math.min(${v}, ${lim});`);
      return vv;
    };

    const makeLoop = (op, s, e, st) => {
      const [i] = ctx.sym("i");
      const terms = [`${i} ${op} ${e}`];
      if (ctx.counted) terms.push(`count > 0`);
      const cond = terms.map(t => `(${t})`).join(" && ");
      code.push(
        `for (let ${i} = ${s}; ${cond}; ${i} += ${st})`,
        `  ${block(i)};`
      );
      return code.join("\n");
    };

    if (step === null) step = 1;
    return step > 0
      ? makeLoop("<", low(start, "s", 0), high(end, "e", len), step)
      : makeLoop(">", high(start, "s", `${len}-1`), low(end, "e", -1), step);
  };
};

const makeSlice = (ctx, slice) => renderSlice(ctx, ...parseSlice(slice));

// This hacky bodge allows us to pass jsonpath's slice test
// (which expects this module to be a function)
const slice = (data, start = null, end = null, step = null) => {
  const ns = {};
  const ctx = {
    sym(...pfxs) {
      return pfxs.map(pfx => `${pfx}${(ns[pfx] = (ns[pfx] || 0) + 1)}`);
    }
  };

  const code = renderSlice(
    ctx,
    start,
    end,
    step
  )("data", i => `out.push(data[${i}])`);

  const gen = genfun();
  gen(`data => { ${code} }`);
  const out = [];
  const fun = gen.toFunction({ out });
  fun(data);

  return out;
};

module.exports = Object.assign(slice, { parseSlice, renderSlice, makeSlice });
