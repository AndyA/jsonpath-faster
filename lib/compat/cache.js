"use strict";

const jp = require("jsonpath");
const makePath = require("./path");
const _ = require("lodash");

const checkObj = obj => {
  if (!_.isObject(obj)) throw new Error("obj needs to be an object");
};

function Cache(compiler) {
  const cache = {};

  const instance = {
    compiler,

    _makePath(path) {
      if (typeof path !== "string") throw new Error(`we need a path`);
      return (cache[path] =
        cache[path] || makePath(instance, path, this.pragmas));
    },

    query(obj, path, count, $) {
      checkObj(obj);
      const p = this._makePath(path);
      if (_.isObject(count)) return p.query(obj, undefined, count);
      return p.query(obj, count, $);
    },

    paths(obj, path, count, $) {
      checkObj(obj);
      const p = this._makePath(path);
      if (_.isObject(count)) return p.paths(obj, undefined, count);
      return p.paths(obj, count, $);
    },

    nodes(obj, path, count, $) {
      checkObj(obj);
      const p = this._makePath(path);
      if (_.isObject(count)) return p.nodes(obj, undefined, count);
      return p.nodes(obj, count, $);
    },

    value(obj, path, newValue, $) {
      checkObj(obj);
      return this._makePath(path).value(obj, newValue, $);
    },

    parent(obj, path, $) {
      checkObj(obj);
      return this._makePath(path).parent(obj, $);
    },

    apply(obj, path, fn, $) {
      checkObj(obj);
      return this._makePath(path).apply(obj, fn, $);
    },

    parse(path) {
      return jp.parse(path);
    },

    stringify(path) {
      return jp.stringify(path);
    }
  };

  return instance;
}

module.exports = Cache;
