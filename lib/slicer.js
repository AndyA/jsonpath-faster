"use strict";

const parseSlice = slice => {
  const parts = slice.split(":");

  const norm = (...parts) => {
    if (parts.length < 2)
      throw new Error(`Too few components in slice: ${slice}`);
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
        `for (var ${i} = ${s}; ${cond}; ${i} += ${st})`,
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

module.exports = { parseSlice, renderSlice, makeSlice };
