"use strict";

const genfun = require("generate-function");

const _ = require("lodash");
const { makeTree, mergeTrees, renderTree } = require("./merge");
const { makeTerminal, prefix } = require("./tokens");
const addPragmas = require("./pragmas");
const { fun } = require("./util");

const idFactory = base => (next => () => `${base}${next++}`)(1);

function Nest(jp, mountPoint) {
  let tree = [];
  const nextName = idFactory("action");
  const actions = {};
  let nextGroup = 0;
  let handler;

  const makeAction = action => {
    const name = nextName();
    actions[name] = fun(action);
    return name;
  };

  const addTree = ast => {
    handler = undefined;
    tree = mergeTrees(tree, makeTree(ast));
  };

  const construct = proto => {
    const nest = (obj, $) => nest.compile()(obj, $, jp);

    return Object.assign(nest, proto, {
      render() {
        return renderTree(tree);
      },

      generate() {
        return jp.compiler.compile(this.render(), {});
      },

      compile() {
        return (handler =
          handler ||
          genfun()(
            `function (obj, $, jp) { ${this.generate()}; return obj; }`
          ).toFunction(actions));
      },

      nest(path) {
        const mountPoint = prefix(jp.parse(path), this.mountPoint);
        return construct({ ...this, mountPoint });
      },

      at(paths, lastly) {
        const terminal = makeTerminal(lastly, this.pragmas, nextGroup++);
        for (const path of _.castArray(paths)) {
          const ast = prefix(jp.parse(path), this.mountPoint);
          addTree([...ast, terminal]);
        }
        return this;
      },

      _addAction(path, stub, cb) {
        const getArgs = length => {
          const args = ["@.value", "@.path", "$"];
          if (length > args.length)
            throw new Error(
              `Too many args to callback (expected 0-${args.length})`
            );
          return args.slice(0, length).join(", ");
        };

        return this.at(
          path,
          stub(
            makeAction(cb),
            typeof cb === "function" ? getArgs(cb.length) : ""
          )
        );
      },

      visitor(path, vis) {
        return this._addAction(path, (cb, args) => `${cb}(${args});`, vis);
      },

      mutator(path, mut) {
        return this._addAction(
          path,
          (cb, args) => `@.nvalue = ${cb}(${args});`,
          mut
        );
      },

      setter(path, set) {
        return this._addAction(
          path,
          (cb, args) => `@.value = ${cb}(${args});`,
          set
        );
      },
    });
  };

  return addPragmas(
    construct({ pragmas: jp.pragmas, mountPoint }),
    ["leaf", "interior", "string", "unordered"],
    obj => construct(obj)
  );
}

module.exports = { Nest };
