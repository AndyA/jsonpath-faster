"use strict";

const tap = require("tap");

const { nestedLiterals, mergeLiterals } = require("../lib/nested");

const tests = [
  {
    code: "Hello!",
    want: [["Hello!", 0, true]]
  },
  {
    code: "const x = '\\\"';",
    want: [
      ["const x = ", 0, true],
      ["'\\\"'", 1, false],
      [";", 0, true]
    ]
  },
  {
    code: "const x = `name: ${name}`;",
    want: [
      ["const x = ", 0, true],
      ["`name: ", 1, false],
      ["${", 2, false],
      ["name", 2, true],
      ["}", 2, false],
      ["`", 1, false],
      [";", 0, true]
    ]
  },
  {
    code: "const x = `name: ${name.map(n => `[${n}]`).join('')}`;",
    want: [
      ["const x = ", 0, true],
      ["`name: ", 1, false],
      ["${", 2, false],
      ["name.map(n => ", 2, true],
      ["`[", 3, false],
      ["${", 4, false],
      ["n", 4, true],
      ["}", 4, false],
      ["]`", 3, false],
      [").join(", 2, true],
      ["''", 3, false],
      [")", 2, true],
      ["}", 2, false],
      ["`", 1, false],
      [";", 0, true]
    ]
  },
  {
    code: "//// comment\nconst x = 1;",
    want: [
      ["//// comment\n", 1, false],
      ["const x = 1;", 0, true]
    ]
  },
  {
    code: "const x = 1; /* /* /*\n/**/\nconst y = 2;",
    want: [
      ["const x = 1; ", 0, true],
      ["/* /* /*\n/**/", 1, false],
      ["\nconst y = 2;", 0, true]
    ]
  }
];

for (const { code, want } of tests) {
  const got = nestedLiterals(code);
  console.log(got);
  tap.same(got, want, code);
}
