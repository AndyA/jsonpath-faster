"use strict";

const tap = require("tap");
const { bindFactory, bindLastly } = require("../lib/lastly");

tap.test(`recursive`, async () => {
  const expr = bindLastly("@.pathString", {
    path: () => ({ code: "path" }),
    pathString: () => ({ code: "jp.stringify(@.path)" })
  });
  tap.equals(expr, "jp.stringify(path);", `recursive resolution`);
});

tap.test(`syntax`, async () => {
  const expr = bindLastly("@.pathString.length", {
    path: () => ({ code: "path" }),
    pathString: () => ({ code: "jp.stringify(@.path)" })
  });
  tap.equals(expr, "jp.stringify(path).length;", `syntax`);
});

tap.test(`binding`, async () => {
  const ids = {};
  const ctx = {
    sym(name) {
      const next = (ids[name] = (ids[name] || 0) + 1);
      return [name + next];
    },

    lval() {
      return "obj";
    }
  };

  const factory = bindFactory(ctx);

  const context = {
    value: () => ({ code: ctx.lval() }),
    path: () => {
      return factory("path", v => `var ${v} = stack.slice(0);`);
    },
    tracer: () => {
      const [name] = ctx.sym("tracer");
      return {
        pre: `console.log("init ${name}");`,
        post: `console.log("teardown ${name}");`,
        code: `console.log("use ${name}");`
      };
    }
  };

  // vim thinks a bare brace is an object literal
  if (1) {
    const expr = bindLastly("@.tracer; @.tracer; @.tracer;", context);
    const got = expr.match(/\w+\s+tracer\d+/g);
    const want = [
      "init tracer1",
      "init tracer2",
      "init tracer3",
      "use tracer1",
      "use tracer2",
      "use tracer3",
      "teardown tracer3",
      "teardown tracer2",
      "teardown tracer1"
    ];
    tap.same(got, want, `post called in reverse order`);
  }

  if (1) {
    const expr = bindLastly("callback(@.path, @.path);", context);
    tap.same(expr.match(/\bslice\b/g), ["slice"], `stack eval only once`);
  }
});

tap.test(`negative`, async () => {
  tap.throws(
    () => bindLastly("@", {}),
    /direct access/i,
    `No direct access to context`
  );

  tap.throws(
    () => bindLastly("@.foo", {}),
    /has no.*foo/i,
    `Missing from context`
  );
});
