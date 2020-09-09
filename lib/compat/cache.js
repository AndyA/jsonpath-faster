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

    visit(obj, path, fn, $) {
      return this._makePath(path).visit(obj, fn, $);
    },

    parse(path) {
      return jp.parse(path);
    },

    stringify(ast) {
      if (_.isArray(ast) && ast.length && !_.isObject(ast[0])) {
        let path = "$";
        for (let i = ast[0] === "$" ? 1 : 0; i < ast.length; i++) {
          if (typeof ast[i] === "number") path = path + "[" + ast[i] + "]";
          else if (/^[_a-z]\w*$/i.test(ast[i])) path = path + "." + ast[i];
          else path = path + "[" + JSON.stringify(ast[i]) + "]";
        }
        return path;
      }
      return jp.stringify(ast);
    }
  };

  return instance;
}

module.exports = Cache;
