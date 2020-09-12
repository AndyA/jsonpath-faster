// automatically translated from node_modules/jsonpath/test/stringify.js
const tap = require("tap");
var assert = require("assert");
var jp = require("../../").strict;
tap.test("stringify", async function () {
  tap.test("simple path stringifies", async function () {
    var string = jp.stringify(["$", "a", "b", "c"]);
    tap.same(string, "$.a.b.c");
  });
  tap.test("numeric literals end up as subscript numbers", async function () {
    var string = jp.stringify(["$", "store", "book", 0, "author"]);
    tap.same(string, "$.store.book[0].author");
  });
  tap.test("simple path with no leading root stringifies", async function () {
    var string = jp.stringify(["a", "b", "c"]);
    tap.same(string, "$.a.b.c");
  });
  tap.test("simple parsed path stringifies", async function () {
    var path = [
      {
        scope: "child",
        operation: "member",
        expression: {
          type: "identifier",
          value: "a",
        },
      },
      {
        scope: "child",
        operation: "member",
        expression: {
          type: "identifier",
          value: "b",
        },
      },
      {
        scope: "child",
        operation: "member",
        expression: {
          type: "identifier",
          value: "c",
        },
      },
    ];
    var string = jp.stringify(path);
    tap.same(string, "$.a.b.c");
  });
  tap.test("keys with hyphens get subscripted", async function () {
    var string = jp.stringify(["$", "member-search"]);
    tap.same(string, '$["member-search"]');
  });
  tap.test("complicated path round trips", async function () {
    var pathExpression = '$..*[0:2].member["string-xyz"]';
    var path = jp.parse(pathExpression);
    var string = jp.stringify(path);
    tap.same(string, pathExpression);
  });
  tap.test("complicated path with filter exp round trips", async function () {
    var pathExpression = "$..*[0:2].member[?(@.val > 10)]";
    var path = jp.parse(pathExpression);
    var string = jp.stringify(path);
    tap.same(string, pathExpression);
  });
  tap.test("throws for no input", async function () {
    tap.throws(function () {
      jp.stringify();
    }, /we need a path/);
  });
});
