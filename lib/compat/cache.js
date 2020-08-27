"use strict";

const jp = require("jsonpath");
const makePath = require("./path");
const _ = require("lodash");

const checkObj = obj => {
  if (!_.isObject(obj)) throw new Error("obj needs to be an object");
};

class Cache {
  constructor(compiler) {
    this.compiler = compiler;
    this.cache = {};
  }

  makePath(path) {
    if (typeof path !== "string") throw new Error(`we need a path`);
    return (this.cache[path] = this.cache[path] || makePath(this, path));
  }

  query(obj, path, count, $) {
    checkObj(obj);
    const p = this.makePath(path);
    if (_.isObject(count)) return p.query(obj, undefined, count);
    return p.query(obj, count, $);
  }

  paths(obj, path, count, $) {
    checkObj(obj);
    const p = this.makePath(path);
    if (_.isObject(count)) return p.paths(obj, undefined, count);
    return p.paths(obj, count, $);
  }

  nodes(obj, path, count, $) {
    checkObj(obj);
    const p = this.makePath(path);
    if (_.isObject(count)) return p.nodes(obj, undefined, count);
    return p.nodes(obj, count, $);
  }

  value(obj, path, newValue, $) {
    checkObj(obj);
    return this.makePath(path).value(obj, newValue, $);
  }

  parent(obj, path, $) {
    checkObj(obj);
    return this.makePath(path).parent(obj, $);
  }

  apply(obj, path, fn, $) {
    checkObj(obj);
    return this.makePath(path).apply(obj, fn, $);
  }

  parse(path) {
    return jp.parse(path);
  }

  stringify(path) {
    return jp.stringify(path);
  }
}

module.exports = Cache;
