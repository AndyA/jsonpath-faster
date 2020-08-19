"use strict";

const engine = require("./lib/engine");
const Cache = require("./lib/compat/cache");

module.exports = new Cache(engine);
