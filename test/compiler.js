"use strict";

const tap = require("tap");
const jp = require("..");

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

const addTerminal = (path, lastly, ctx) => {
  const ast = jp.parse(path);
  return jp.compiler.compile(
    [...ast, { operation: "terminal", scope: "internal", lastly }],
    ctx
  );
};

tap.test(`read-only props`, async () => {
  tap.throws(
    () => addTerminal("$.foo.bar", ctx => `@.path = []`, {}),
    /path.*read-only/i
  );

  tap.throws(
    () => addTerminal("$.foo.bar", ctx => `@.parent = []`, {}),
    /parent.*read-only/i
  );
});

tap.test(`bad use`, async () => {
  const ctx = jp.compiler.makeContext({});
  tap.throws(() => ctx.use("flibble"), /in library/i, `bad use`);
});
