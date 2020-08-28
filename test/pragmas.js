"use strict";

const tap = require("tap");
const addPragmas = require("../lib/pragmas");

const log = [];
const base = {
  count: 0,
  apply(obj) {
    this.count++;
    const { pragmas, count } = this;
    log.push({ obj, pragmas, count });
  }
};

const thing = addPragmas(base, ["inside", "outside"], obj => {
  obj.count = 0;
  return obj;
});

const nother = addPragmas(base, ["in", "out"]);

let hit = 1;
thing.apply({ hit: hit++ });
nother.apply({ hit: hit++ });
thing.inside.apply({ hit: hit++ });
thing.outside.apply({ hit: hit++ });
nother.in.apply({ hit: hit++ });
thing.inside.outside.apply({ hit: hit++ });
thing.outside.outside.apply({ hit: hit++ });
thing.outside.inside.apply({ hit: hit++ });
nother.out.apply({ hit: hit++ });
thing.inside.outside.apply({ hit: hit++ });
thing.outside.apply({ hit: hit++ });
nother.in.apply({ hit: hit++ });
thing.inside.apply({ hit: hit++ });
thing.apply({ hit: hit++ });

const want = [
  { obj: { hit: 1 }, pragmas: {}, count: 1 },
  { obj: { hit: 2 }, pragmas: {}, count: 2 },
  { obj: { hit: 3 }, pragmas: { inside: true }, count: 1 },
  { obj: { hit: 4 }, pragmas: { outside: true }, count: 1 },
  { obj: { hit: 5 }, pragmas: { in: true }, count: 3 },
  { obj: { hit: 6 }, pragmas: { inside: true, outside: true }, count: 1 },
  { obj: { hit: 7 }, pragmas: { outside: true }, count: 2 },
  { obj: { hit: 8 }, pragmas: { outside: true, inside: true }, count: 1 },
  { obj: { hit: 9 }, pragmas: { out: true }, count: 3 },
  { obj: { hit: 10 }, pragmas: { inside: true, outside: true }, count: 2 },
  { obj: { hit: 11 }, pragmas: { outside: true }, count: 3 },
  { obj: { hit: 12 }, pragmas: { in: true }, count: 4 },
  { obj: { hit: 13 }, pragmas: { inside: true }, count: 2 },
  { obj: { hit: 14 }, pragmas: {}, count: 3 }
];

tap.same(log, want, `pragmas`);
