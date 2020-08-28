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
    [
      ...jp.parse(path),
      { operation: "terminal", scope: "internal", lastly, pragmas: {} }
    ],
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
  const props = ["path", "pathString"];
  for (const ro of props) {
    tap.throws(
      () => addTerminal("$.foo.bar", ctx => `@.${ro} = []`, {}),
      new RegExp(`${ro}.*read-only`, "i"),
      `${ro} is read-only`
    );
  }
});

tap.test(`bad use`, async () => {
  const ctx = jp.compiler.makeContext({});
  tap.throws(() => ctx.use("flibble"), /in library/i, `bad use`);
});
