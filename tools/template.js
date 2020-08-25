"use strict";

const inspect = require("../lib/inspect");

const jp = (strings, ...key) => {
  return {
    nodes(...args) {
      return { strings, key, args };
    }
  };
};

const i = 12;
const j = 3;
const obj = {};
const x = jp`$.names[${i}][${j}]..id`.nodes(obj);

console.log(inspect(x));

process.exit(1);

// I'd like this to work. Think it can. However the appeal is
// limited to literal paths.
jp`$.names[${i}][${j}]..id`.each(obj, (value, path) => {});

// This would also be nice.
const v = jp`$.name[0][0].id`.value(obj);
