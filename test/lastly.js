"use strict";

const tap = require("tap");
const { bindLastly } = require("../lib/lastly");

tap.test(`recursive`, async () => {
  const expr = bindLastly("@.pathString", {
    path: () => "path",
    pathString: () => "jp.stringify(@.path)"
  });
  tap.equals(expr, "jp.stringify(path)", `recursive resolution`);
});

tap.test(`syntax`, async () => {
  const expr = bindLastly("@.pathString.length", {
    path: () => "path",
    pathString: () => "jp.stringify(@.path)"
  });
  tap.equals(expr, "jp.stringify(path).length", `syntax`);
});

tap.test(`negative`, async () => {
  tap.throws(
    () => bindLastly("@", {}),
    /direct access/i,
    `No direct access to context`
  );

  tap.throws(
    () => bindLastly("@.foo", {}),
    /has no.*foo/i,
    `Missing from context`
  );
});
