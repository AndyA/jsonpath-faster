"use strict";

const path = require("path");

const Checkout = require("./checkout");

const whatName = what => (/^[0-9a-f]+$/.test(what) ? what.substr(0, 7) : what);

async function getWorkers(things) {
  const co = new Checkout();

  const workers = await Promise.all(
    things.map(async what => {
      if (what === "HEAD") return { what, dir: ".", jp: require("../..") };
      if (what === "jsonpath") return { what, jp: require("jsonpath") };

      const dir = await co.checkout(what);
      const jp = require(path.join("..", "..", dir));

      return { what, dir, jp };
    })
  );

  return workers.map(w => ({ ...w, name: whatName(w.what) }));
}

module.exports = getWorkers;
