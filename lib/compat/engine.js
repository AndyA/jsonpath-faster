"use strict";

const jp = require("jsonpath");
const makePath = require("./path");
const _ = require("lodash");

function makeEngine(cache) {
  return {
    _makePath(path) {
      if (typeof path !== "string") throw new Error(`we need a path`);
      return cache(this.pragmaKey, path, () =>
        makePath(this, path, this.pragmas)
      );
    },

    _checkObj(obj) {
      if (this.pragmas.strict && !_.isObject(obj))
        throw new Error("obj needs to be an object");
    },

    query(obj, path, count, $) {
      this._checkObj(obj);
      const p = this._makePath(path);
      if (_.isObject(count)) return p.query(obj, undefined, count);
      return p.query(obj, count, $);
    },

    paths(obj, path, count, $) {
      this._checkObj(obj);
      const p = this._makePath(path);
      if (_.isObject(count)) return p.paths(obj, undefined, count);
      return p.paths(obj, count, $);
    },

    nodes(obj, path, count, $) {
      this._checkObj(obj);
      const p = this._makePath(path);
      if (_.isObject(count)) return p.nodes(obj, undefined, count);
      return p.nodes(obj, count, $);
    },

    value(obj, path, newValue, $) {
      this._checkObj(obj);
      return this._makePath(path).value(obj, newValue, $);
    },

    parent(obj, path, $) {
      this._checkObj(obj);
      return this._makePath(path).parent(obj, $);
    },

    apply(obj, path, fn, $) {
      this._checkObj(obj);
      return this._makePath(path).apply(obj, fn, $);
    },

    visit(obj, path, fn, $) {
      this._checkObj(obj);
      return this._makePath(path).visit(obj, fn, $);
    },

    parse(path) {
      return jp.parse(path);
    },

    stringify(ast) {
      if (_.isArray(ast) && ast.length) {
        let path = "$";
        for (let i = ast[0] === "$" ? 1 : 0; i < ast.length; i++) {
          if (typeof ast[i] === "object") return jp.stringify(ast);
          else if (typeof ast[i] === "number") path = path + "[" + ast[i] + "]";
          else if (/^[_a-z]\w*$/i.test(ast[i])) path = path + "." + ast[i];
          else path = path + "[" + JSON.stringify(ast[i]) + "]";
        }
        return path;
      }
      return jp.stringify(ast);
    }
  };
}

module.exports = makeEngine;
