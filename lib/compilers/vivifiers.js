"use strict";

const { js } = require("../util");

const vivifierCompiler = [
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
  }
];

const shouldVivify = [
  {
    when: [
      {
        scope: "child",
        operation: "member",
        expression: { type: ["identifier", "numeric_literal"] }
      },
      {
        scope: "child",
        operation: "subscript",
        expression: {
          type: ["string_literal", "numeric_literal", "script_expression"]
        }
      },
      { scope: "internal", operation: "terminal" },
      {
        expression: { type: "root", value: "$" }
      }
    ],
    gen: tok => true
  },
  { when: {}, gen: tok => false }
];

module.exports = { vivifierCompiler, shouldVivify };
