// automatically translated from node_modules/jsonpath/test/sugar.js
const tap = require("tap");
var assert = require("assert");
var jp = require("../../").strict;
var util = require("util");
tap.test("sugar", async function () {
  tap.test("parent gets us parent value", async function () {
    var data = {
      a: 1,
      b: 2,
      c: 3,
      z: {
        a: 100,
        b: 200,
      },
    };
    var parent = jp.parent(data, "$.z.b");
    tap.same(parent, data.z);
  });
  tap.test("apply method sets values", async function () {
    var data = {
      a: 1,
      b: 2,
      c: 3,
      z: {
        a: 100,
        b: 200,
      },
    };
    jp.apply(data, "$..a", function (v) {
      return v + 1;
    });
    tap.same(data.a, 2);
    tap.same(data.z.a, 101);
  });
  tap.test(
    "apply method applies survives structural changes",
    async function () {
      var data = {
        a: {
          b: [
            1,
            {
              c: [2, 3],
            },
          ],
        },
      };
      jp.apply(data, "$..*[?(@.length > 1)]", function (array) {
        return array.reverse();
      });
      tap.same(data.a.b, [
        {
          c: [3, 2],
        },
        1,
      ]);
    }
  );
  tap.test("value method gets us a value", async function () {
    var data = {
      a: 1,
      b: 2,
      c: 3,
      z: {
        a: 100,
        b: 200,
      },
    };
    var b = jp.value(data, "$..b");
    tap.same(b, data.b);
  });
  tap.test("value method sets us a value", async function () {
    var data = {
      a: 1,
      b: 2,
      c: 3,
      z: {
        a: 100,
        b: 200,
      },
    };
    var b = jp.value(data, "$..b", "5000");
    tap.same(b, 5000);
    tap.same(data.b, 5000);
  });
  tap.test("value method sets new key and value", async function () {
    var data = {};
    var a = jp.value(data, "$.a", 1);
    var c = jp.value(data, "$.b.c", 2);
    tap.same(a, 1);
    tap.same(data.a, 1);
    tap.same(c, 2);
    tap.same(data.b.c, 2);
  });
  tap.test("value method sets new array value", async function () {
    var data = {};
    var v1 = jp.value(data, "$.a.d[0]", 4);
    var v2 = jp.value(data, "$.a.d[1]", 5);
    tap.same(v1, 4);
    tap.same(v2, 5);
    tap.same(data.a.d, [4, 5]);
  });
  tap.test("value method sets non-literal key", async function () {
    var data = {
      list: [
        {
          index: 0,
          value: "default",
        },
        {
          index: 1,
          value: "default",
        },
      ],
    };
    jp.value(data, "$.list[?(@.index == 1)].value", "test");
    tap.same(data.list[1].value, "test");
  });
  tap.test(
    "paths with a count gets us back count many paths",
    async function () {
      data = [
        {
          a: [1, 2, 3],
          b: [-1, -2, -3],
        },
        {},
      ];
      paths = jp.paths(data, "$..*", 3);
      tap.same(paths, [
        ["$", "0"],
        ["$", "1"],
        ["$", "0", "a"],
      ]);
    }
  );
});
