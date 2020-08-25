"use strict";

module.exports = obj =>
  require("util").inspect(obj, {
    depth: null,
    sorted: true,
    getters: true
  });
