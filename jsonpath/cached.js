"use strict";

const jp = require("jsonpath");
const Compiler = require("./compiler");

class Cached {
  constructor() {
    this._cache = {};
    this._compiler = new Compiler({ fallback: false });
  }

  static get jp() {
    return (this._jp = this._jp || new this());
  }

  compiled(path, key, opt) {
    const slot = (this._cache[path] = this._cache[path] || {});
    return (slot[key] = slot[key] || this._compiler.compile(path, opt));
  }

  collect(obj, path, key, opt) {
    const out = [];
    this.compiled(path, key, opt)(obj, r => out.push(r), opt.count);
    return out;
  }

  query(obj, path, count) {
    return this.collect(obj, path, "query", {
      count,
      pathInfo: false
    }).map(r => r.value);
  }

  nodes(obj, path, count) {
    return this.collect(obj, path, "nodes", {
      count,
      pathInfo: true
    });
  }

  paths(obj, path, count) {
    return this.nodes(obj, path, count).map(n => n.path);
  }

  value(obj, path, newValue) {
    if (arguments.length === 2) return this.query(obj, path, 1)[0];
    const vf = this.compiled(path, "vivify", { vivify: true, pathInfo: false });
    return vf(obj, newValue);
  }

  parent(obj, path) {
    throw new Error("Not implemented");
  }

  apply(obj, path, fn) {
    throw new Error("Not implemented");
  }

  parse(path) {
    return jp.parse(path);
  }

  stringify(path) {
    return jp.stringify(path);
  }
}

module.exports = Cached;
