"use strict";

const { undefer } = require("./util");

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
    if (v === "") return v;
    if (isNaN(v)) throw new Error(`Non-numeric element in slice ${slice}`);
    return Number(v);
  });
};

const renderSlice = (ctx, start, end, step) => {
  return (lval, block) => {
    if (step === "") step = 1;
    if (step === 0) throw new Error(`Step may not be 0`);

    const code = [];
    const len = `${lval}.length`;

    const wrapLow = (v, sym, lim) => {
      const [s] = ctx.sym(sym);
      code.push(`const ${s} = Math.max(${len}${v}, ${lim});`);
      return s;
    };

    const wrapHigh = (v, sym, lim) => {
      const [e] = ctx.sym(sym);
      if (v < 0) code.push(`const ${e} = Math.max(0, ${len}${v});`);
      else code.push(`const ${e} = Math.min(${v}, ${lim});`);
      return e;
    };

    const makeLoop = op => {
      const [i] = ctx.sym("i");
      code.push(
        `for (let ${i} = ${start}; ${i} ${op} ${end}; ${i} += ${step})`,
        `  ${undefer(block, i)};`
      );
      return code.join("\n");
    };

    if (step > 0) {
      if (start === "") start = 0;
      else if (start < 0) start = wrapLow(start, "s", 0);

      if (end === "") end = len;
      else end = wrapHigh(end, "e", len);

      return makeLoop("<");
    } else {
      if (start === "") start = `${len}-1`;
      else start = wrapHigh(start, "s", `${len}-1`);

      if (end === "") end = -1;
      else if (end < 0) end = wrapLow(end, "e", -1);

      return makeLoop(">");
    }
  };
};

module.exports = { parseSlice, renderSlice };
