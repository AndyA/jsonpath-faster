"use strict";

const tap = require("tap");
const { mkIdent } = require("../lib/ident");

tap.test(`mkIdent`, async () => {
  const id1 = mkIdent();
  tap.match(id1, /^[a-z]+$/, `standard ident`);
  const id2 = mkIdent(30);
  tap.equal(id2.length, 30, `longer idents`);
});
