"use strict";

const _ = require("lodash");
const { bindFactory, bindLastly } = require("../lib/lastly");

const compileLastly = code => {
  const factory = bindFactory();
  const ctx = {
    path: () => factory("path", v => `var ${v} = stack.slice(0);`),
    pathString: () =>
      factory("pathString", v => `var ${v} = jp.stringify(@.path)`)
  };

  const expr = bindLastly(code, ctx);
  return expr;
};

const expr = compileLastly(
  "if (@.pathString.length > 3) console.log(`Long ${@.pathString}`);"
);

console.log(expr);
