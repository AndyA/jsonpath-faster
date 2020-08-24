"use strict";

const { js } = require("../util");

module.exports = [
  {
    when: {
      expression: { type: "numeric_literal" },
      operation: "subscript",
      scope: "child"
    },
    gen: tok => js([])
  },
  {
    when: {
      expression: { type: ["identifier", "string_literal", "numeric_literal"] },
      operation: ["member", "subscript"],
      scope: "child"
    },
    gen: tok => js({})
  },
  {
    when: {
      operation: "terminal",
      scope: "internal"
    },
    gen: tok => true
  }
];
