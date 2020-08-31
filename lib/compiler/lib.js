"use strict";

module.exports = {
  isObject: {
    code: [`function isObject(o) { return o === Object(o); }`]
  },
  stringify: {
    code: [
      `function stringify(ast) {`,
      `  var path = "$";`,
      `  for (var i = 1; i < ast.length; i++) {`,
      `    if (typeof ast[i] === "number") path = path + "[" + ast[i] + "]";`,
      `    else if (/^[_a-z]\\w*$/i.test(ast[i])) path = path + "." + ast[i];`,
      `    else path = path + "[" + JSON.stringify(ast[i]) + "]";`,
      `  }`,
      `  return path;`,
      `}`
    ]
  }
};
