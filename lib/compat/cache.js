"use strict";

const jp = require("jsonpath");
const makePath = require("./path");

class Cache {
  constructor(compiler) {
    this.compiler = compiler;
    this.cache = {};
  }

  makePath(path) {
    return (this.cache[path] =
      this.cache[path] || makePath(this.compiler, path));
  }

  query(obj, path, count) {
    return this.makePath(path).query(obj, count);
  }

  paths(obj, path, count) {
    return this.makePath(path).paths(obj, count);
  }

  nodes(obj, path, count) {
    return this.makePath(path).nodes(obj, count);
  }

  value(obj, path, newValue) {
    return this.makePath(path).value(obj, newValue);
  }

  parent(obj, path) {
    return this.makePath(path).parent(obj);
  }

  apply(obj, path, fn) {
    return this.makePath(path).apply(obj, fn);
  }

  parse(path) {
    return jp.parse(path);
  }

  stringify(path) {
    return jp.stringify(path);
  }
}

module.exports = Cache;
