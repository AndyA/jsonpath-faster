"use strict";

const tap = require("tap");
const { bindFactory, bindLastly } = require("../lib/lastly");

const getCode = expr => {
  return [expr.pre, expr.code, expr.post].filter(c => c && c.length).join("\n");
};

tap.test(`recursive`, async () => {
  const expr = getCode(
    bindLastly("@.pathString", {
      path: () => ({ code: "path" }),
      pathString: () => ({ code: "jp.stringify(@.path)" })
    })
  );
  tap.equal(expr, "jp.stringify(path);", `recursive resolution`);
});

tap.test(`syntax`, async () => {
  const expr = getCode(
    bindLastly("@.pathString.length", {
      path: () => ({ code: "path" }),
      pathString: () => ({ code: "jp.stringify(@.path)" })
    })
  );
  tap.equal(expr, "jp.stringify(path).length;", `syntax`);
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
    const expr = getCode(bindLastly("@.tracer; @.tracer; @.tracer;", context));
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
    const expr = getCode(bindLastly("callback(@.path, @.path);", context));
    tap.same(expr.match(/\bslice\b/g), ["slice"], `stack eval only once`);
  }
});

tap.test(`assign`, async () => {
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

  const makeContext = tracker => ({
    value: lhs => {
      tracker("value", lhs);
      return { code: ctx.lval() };
    },
    path: lhs => {
      if (lhs) throw new Error(`@.path is read-only`);
      return factory("path", v => `var ${v} = stack.slice(0);`);
    }
  });

  const tests = [
    { code: `console.log(@.value)`, want: [["value", false]] },
    { code: `@.value = "Hello"`, want: [["value", true]] },
    { code: `@.value.x = []`, want: [["value", true]] },
    {
      code: `@.value = cook(@.value, @.path)`,
      want: [
        ["value", true],
        ["value", false]
      ]
    },
    { code: `scope[@.value] = true`, want: [["value", false]] },
    { code: `@.value++`, want: [["value", true]] },
    {
      code: `@.value += @.value`,
      want: [
        ["value", true],
        ["value", false]
      ]
    },
    {
      code: `if (@.value < 0) @.value = 0`,
      want: [
        ["value", false],
        ["value", true]
      ]
    },
    {
      // Fairly improbable
      code: `for (@.value = 0; @.value < 10; @.value++) console.log(@.value)`,
      want: [
        ["value", true],
        ["value", false],
        ["value", true],
        ["value", false]
      ]
    }
  ];

  for (const { code, want } of tests) {
    const log = [];
    const context = makeContext((...args) => log.push(args));
    const expr = getCode(bindLastly(code, context));
    tap.same(log, want, `assign? ${code}`);
  }

  // Check we can't assign to @.path
  const context = makeContext(() => false);
  tap.throws(() => bindLastly("@.path = []", context), /read-only/i);
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
