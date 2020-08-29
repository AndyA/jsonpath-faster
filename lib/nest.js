"use strict";

const _ = require("lodash");
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

  const makeAction = action => {
    const name = nextName();
    actions[name] = fun(action);
    return name;
  };

  let handler;

  const construct = proto => {
    const nest = (obj, $) => nest.compile()(obj, $);

    return Object.assign(nest, proto, {
      action(path, stub, cb) {
        return nest.at(
          path,
          stub(
            makeAction(cb),
            typeof cb === "function"
              ? cb.length < 2
                ? `@.value`
                : `@.value, @.path`
              : ""
          )
        );
      },

      addTree(ast) {
        handler = undefined;
        tree = mergeTrees(tree, makeTree(ast));
        return this;
      },

      render() {
        return renderTree(tree);
      },

      at(path, lastly) {
        const ast = prefix(jp.parse(path), this.mountPoint);
        return this.addTree([
          ...ast,
          makeTerminal(lastly, this.pragmas, nextGroup++)
        ]);
      },

      // TODO call this nest and allow jp.nest to take a prefix
      // path. Hence.
      //
      // jp.nest("$.foo").nest("$.bar").visitor(...)
      nest(path) {
        const mountPoint = prefix(jp.parse(path), this.mountPoint);
        return construct({ ...this, mountPoint });
      },

      visitor(path, vis) {
        return this.action(path, (cb, args) => `${cb}(${args});`, vis);
      },

      mutator(path, mut) {
        return this.action(
          path,
          (cb, args) => `@.nvalue = ${cb}(${args});`,
          mut
        );
      },

      setter(path, set) {
        return this.action(
          path,
          (cb, args) => `@.value = ${cb}(${args});`,
          set
        );
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
