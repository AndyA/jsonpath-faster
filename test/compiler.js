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

tap.test(`bad use`, async () => {
  const ctx = jp.compiler.makeContext({});
  tap.throws(() => ctx.use("flibble"), /in library/i, `bad use`);
});
