"use strict";

const tap = require("tap");
const jp = require("..");
const genfun = require("generate-function");

tap.test(`bad AST`, async () => {
  tap.throws(() => jp.compiler.compile([], {}), /unexpected end/i, `short ast`);
  tap.throws(
    () => jp.compiler.compile([{ oops: true }], {}),
    /unhandled.*structure/i,
    `bad structural token`
  );
  tap.throws(
    () => jp.compiler.compile([{ scope: "child", oops: true }], {}),
    /unhandled.*selector/i,
    `bad selector token`
  );
});

const addTerminal = (path, lastly, ctx) =>
  jp.compiler.compile(
    [...jp.parse(path), { operation: "terminal", scope: "internal", lastly }],
    ctx
  );

const fun = (path, lastly, ctx) => {
  const code = addTerminal(path, lastly, ctx);

  const gen = genfun();
  gen(`function(obj, count, extra) { ${code} }`);
  const f = gen.toFunction({ jp });
  return f;
};

tap.test(`read-only props`, async () => {
  const props = ["path", "parent", "pathString"];
  for (const ro of props) {
    tap.throws(
      () => addTerminal("$.foo.bar", ctx => `@.${ro} = []`, {}),
      new RegExp(`${ro}.*read-only`, "i"),
      `${ro} is read-only`
    );
  }
});

tap.test(`@ properties`, async () => {
  const f = fun("$..*", ctx => `extra(@.leaf, @.nleaf, @.pathString)`, {});
  const obj = { foo: [{ name: "A" }, { name: "B" }], bar: "String" };
  const log = [];
  const want = [
    ["String", "String", "$.bar"],
    ["A", "A", "$.foo[0].name"],
    ["B", "B", "$.foo[1].name"]
  ];
  f(obj, 1, (...args) => log.push(args));
  tap.same(log, want, `leaf, nleaf and pathString`);
});

tap.test(`bad use`, async () => {
  const ctx = jp.compiler.makeContext({});
  tap.throws(() => ctx.use("flibble"), /in library/i, `bad use`);
});
