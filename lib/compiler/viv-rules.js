"use strict";

const { js } = require("../util");
const { makeLadder } = require("../tokens");

const vivifyType = makeLadder([
  {
    when: {
      expression: { type: "numeric_literal" },
      operation: "subscript",
      scope: "child"
    },
    gen: () => js([])
  },
  {
    when: {
      expression: { type: ["identifier", "string_literal", "numeric_literal"] },
      operation: ["member", "subscript"],
      scope: "child"
    },
    gen: () => js({})
  }
]);

const shouldVivify = makeLadder([
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
    gen: () => true
  }
]);

module.exports = { vivifyType, shouldVivify };
