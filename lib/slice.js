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
    if (v === "") {
      switch (i) {
        case 0:
          return 0;
        case 1:
          return "";
        case 2:
          return 1;
      }
    }
    if (isNaN(v)) throw new Error(`Non-numeric element in slice ${slice}`);
    return Number(v);
  });
};

const renderSlice = (ctx, start, end, step) => {
  return (lval, block) => {
    if (step <= 0) throw new Error(`Non positive step ${step}`);
    const code = [];

    if (start < 0) {
      const [s] = ctx.sym("s");
      code.push(`const ${s} = Math.max(0, ${lval}.length${start});`);
      start = s;
    }

    if (end === "") {
      end = `${lval}.length`;
    } else {
      const [e] = ctx.sym("e");
      if (end < 0) code.push(`const ${e} = ${lval}.length${end};`);
      else code.push(`const ${e} = Math.min(${end}, ${lval}.length);`);
      end = e;
    }

    const [i] = ctx.sym("i");
    return [
      ...code,
      `for (let ${i} = ${start}; ${i} < ${end}; ${i} += ${step})`,
      `  ${undefer(block, i)};`
    ].join("\n");
  };
};

module.exports = { parseSlice, renderSlice };
