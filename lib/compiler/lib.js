"use strict";

module.exports = {
  isObject: {
    code: [`function isObject(o) { return o === Object(o); }`]
  },
  stringify: {
    code: [
      `function stringify(ast) {`,
      `  return ast`,
      `    .map(function(tok, index) {`,
      `      if (!index) return "$";`,
      `      if (typeof tok === "number") return "[" + tok + "]";`,
      `      if (/^[a-z]\\w*$/.test(tok)) return "." + tok;`,
      `      return "[" + JSON.stringify(tok) + "]";`,
      `    })`,
      `    .join("");`,
      `}`
    ]
  }
};
