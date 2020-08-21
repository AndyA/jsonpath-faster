"use strict";

const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
const fg = require("fast-glob");

const esprima = require("esprima");
const estraverse = require("estraverse");
const escodegen = require("escodegen");
const prettier = require("prettier");

const { json, inspect } = require("../lib/util");

async function writeFile(outFile, data) {
  await mkdirp(path.dirname(outFile));
  const tmpFile = outFile + ".tmp";
  await fs.promises.writeFile(tmpFile, data);
  await fs.promises.rename(tmpFile, outFile);
}

async function copy(inFile, outFile) {
  const src = await fs.promises.readFile(inFile, "utf8");
  await writeFile(outFile, src);
}

const makeAssignRequire = (name, value) => ({
  type: "VariableDeclaration",
  declarations: [
    {
      type: "VariableDeclarator",
      id: { type: "Identifier", name },
      init: {
        type: "CallExpression",
        callee: { type: "Identifier", name: "require" },
        arguments: [{ type: "Literal", value }]
      }
    }
  ],
  kind: "const"
});

const assertMap = {
  deepEqual: "same",
  equal: "same",
  throws: "throws"
};

async function tapify(inFile, outFile, pathPrefix) {
  const src = await fs.promises.readFile(inFile, "utf8");
  const ast = esprima.parseScript(src);

  const fixRequirePath = rp => rp.replace(/^\.\./, pathPrefix + "..");

  //  console.log(json(ast));
  ast.body.unshift(makeAssignRequire("tap", "tap"));

  const tap = estraverse.replace(ast, {
    enter: function(node, parent) {
      if (node.type === "CallExpression") {
        const callee = node.callee;
        if (callee.type === "Identifier") {
          if (callee.name === "suite" || callee.name === "test") {
            node.arguments[1].async = true;
            return {
              ...node,
              callee: {
                type: "MemberExpression",
                computed: false,
                object: { type: "Identifier", name: "tap" },
                property: { type: "Identifier", name: "test" }
              }
            };
          }
          if (
            callee.name === "require" &&
            node.arguments.length === 1 &&
            node.arguments[0].type === "Literal"
          ) {
            node.arguments[0].value = fixRequirePath(node.arguments[0].value);
            return;
          }
        } else if (callee.type === "MemberExpression") {
          if (callee.object.name === "assert") {
            const tapAssert = assertMap[callee.property.name];
            if (!tapAssert)
              throw new Error(`Can't map assert.${callee.property.name}`);
            callee.object.name = "tap";
            callee.property.name = tapAssert;
          }
        }
      }
    },
    leave: function(node, parent) {}
  });

  const pretty = prettier.format(escodegen.generate(tap), {
    filepath: outFile
  });

  await writeFile(outFile, pretty);
}

(async () => {
  try {
    const tests = await fg("jsonpath-test/**");

    for (const test of tests) {
      const tap = path.join(
        "test",
        "upstream",
        path.relative("jsonpath-test", test)
      );

      if (/\.js$/.test(test)) {
        console.log(`Converting ${test} to ${tap}`);
        await tapify(test, tap, "../");
      } else {
        console.log(`Copying ${test} to ${tap}`);
        await copy(test, tap);
      }
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
