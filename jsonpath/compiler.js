"use strict";

const jp = require("jsonpath");
const genfun = require("generate-function");
const EventEmitter = require("events");
const _ = require("lodash");

class UnsupportedSyntaxError extends Error {}

class Compiler extends EventEmitter {
  constructor(opt) {
    super();
    this.opt = Object.assign({}, { fallback: false }, opt || {});
    this._next = 1;
  }

  _makeVar() {
    return "o" + this._next++;
  }

  _isToken(tok, like) {
    return _.isEqualWith(tok, _.merge({}, tok, like), (a, b) => {
      if (_.isArray(b)) return b.includes(a);
    });
  }

  _isRoot(tok) {
    return this._isToken(tok, { expression: { type: "root", value: "$" } });
  }

  _isSubscript(tok) {
    return this._isToken(tok, {
      operation: ["member", "subscript"]
    });
  }

  _isLiteral(tok) {
    return this._isToken(tok, {
      expression: { type: ["identifier", "numeric_literal", "string_literal"] }
    });
  }

  _isNumericLiteral(tok) {
    return this._isToken(tok, {
      expression: { type: "numeric_literal" }
    });
  }

  _isWildcard(tok) {
    return this._isToken(tok, {
      //      scope: "child",
      expression: { type: "wildcard", value: "*" }
    });
  }

  _isRecursive(tok) {
    return this._isToken(tok, {
      scope: "descendant"
      //      expression: { type: "wildcard", value: "*" }
    });
  }

  _visitor(path, ast, ident, o) {
    const _s = o => JSON.stringify(o);

    // TODO return here might be inside a nested function
    if (!ast.length) {
      if (o.vivify) return [`${ident} = callback;`, `return callback;`];
      return [
        `if (count !== undefined && --count < 0) return;`,
        o.pathInfo
          ? `callback({value: ${ident}, path: path.slice(0)});`
          : `callback({value: ${ident}});`
      ];
    }

    const pushPath = v => (o.pathInfo ? `path.push(${v})` : ``);
    const popPath = v => (o.pathInfo ? `path.pop()` : ``);

    const next = ast.shift();
    //    console.log(JSON.stringify(next));

    const vn = this._makeVar();

    if (this._isSubscript(next)) {
      if (this._isLiteral(next)) {
        const nextIdent = ident + "[" + _s(next.expression.value) + "]";

        if (o.vivify) {
          const peek = ast[0];
          const action = [...this._visitor(path, ast, nextIdent, o)];
          if (peek) {
            const viv = this._isNumericLiteral(peek) ? "[]" : "{}";
            action.unshift(
              `if (${nextIdent} === undefined) ${nextIdent} = ${viv};`
            );
          }
          return action;
        }

        return [
          `const ${vn} = ${nextIdent};`,
          `if (${vn} !== undefined) {`,
          /**/ pushPath(_s(next.expression.value)),
          /**/ ...this._visitor(path, ast, vn, o),
          /**/ popPath(),
          `}`
        ];
      } else if (this._isWildcard(next)) {
        const recursive = this._isRecursive(next);
        const [vnf, vnk, vnl, vnv, vnw] = ["f", "k", "l", "v", "w"].map(
          s => vn + s
        );
        return [
          `const ${vnf} = v => {`,
          /**/ ...this._visitor(path, ast, "v", o),
          /**/ recursive ? `${vnw}(v);` : ``,
          `};`,
          ``,
          `const ${vnw} = v => {`,
          `  if (_.isArray(v)) {`,
          `    const ${vnl} = v.length;`,
          `    for (let ${vnk} = 0; ${vnk} < ${vnl}; ${vnk}++) {`,
          /*  */ pushPath(vnk),
          `      ${vnf}(v[${vnk}]);`,
          /*  */ popPath(),
          `    }`,
          `  } else if (_.isPlainObject(v)) {`,
          `    for (const [${vnk}, ${vnv}] of Object.entries(v)) {`,
          /*  */ pushPath(vnk),
          `      ${vnf}(${vnv});`,
          /*  */ popPath(),
          `    }`,
          `  }`,
          `};`,
          ``,
          `${vnw}(${ident});`
        ];
      }
    }

    throw new UnsupportedSyntaxError("Can't compile " + path);
  }

  makeFunction(path, opt) {
    const o = Object.assign({}, { pathInfo: true, vivify: false }, opt || {});
    if (o.vivify) o.pathInfo = false;
    const ast = jp.parse(path);
    if (!this._isRoot(ast.shift())) throw new Error("Path must start with '$'");

    return [
      "function(obj, callback, count) {",
      o.pathInfo ? 'const path = ["$"];' : "",
      ...this._visitor(path, ast, "obj", o),
      "}"
    ].join("\n");
  }

  compile(path, opt) {
    // TODO doesn't handle vivification
    const makeNodesShim = p => {
      return (obj, callback, count) => {
        for (const node of jp.nodes(obj, p, count)) callback(node);
      };
    };

    try {
      if (this.opt.fallback === "always")
        throw new UnsupportedSyntaxError("Always use jsonpath");

      const fun = this.makeFunction(path, opt);
      const gen = genfun();
      gen(fun);
      return gen.toFunction({ _ });
    } catch (e) {
      if (e instanceof UnsupportedSyntaxError && this.opt.fallback) {
        this.emit("fallback", { path, opt });
        return makeNodesShim(path);
      }
      throw e;
    }
  }
}

module.exports = Compiler;
