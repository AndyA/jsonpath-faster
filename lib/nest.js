"use strict";

const genfun = require("generate-function");

const { makeTree, mergeTrees, renderTree } = require("./merge");
const { makeTerminal, prefix } = require("./tokens");
const addPragmas = require("./pragmas");
const { js, fun } = require("./util");

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
    const nest = (obj, $) => nest.compile()(obj, $);

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
            `function (obj, $) { ${this.generate()} return obj; }`
          ).toFunction(actions));
      },

      nest(path) {
        const mountPoint = prefix(jp.parse(path), this.mountPoint);
        return construct({ ...this, mountPoint });
      },

      at(path, lastly) {
        const ast = prefix(jp.parse(path), this.mountPoint);
        addTree([...ast, makeTerminal(lastly, this.pragmas, nextGroup++)]);
        return this;
      },

      _addAction(path, stub, cb) {
        return this.at(
          path,
          stub(
            makeAction(cb),
            typeof cb === "function"
              ? cb.length < 2
                ? `@.value`
                : `@.value, @.path, $`
              : ""
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
      }
    });
  };

  return addPragmas(
    construct({ pragmas: jp.pragmas, mountPoint }),
    ["leaf", "interior", "string", "unordered"],
    obj => construct(obj)
  );
}

module.exports = { Nest };
