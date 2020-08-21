const tap = require("tap");
var assert = require("assert");
var jp = require("../../");
var data = require("./data/store.json");
tap.test("orig-google-code-issues", async function () {
  tap.test("comma in eval", async function () {
    var pathExpression = '$..book[?(@.price && ",")]';
    var results = jp.query(data, pathExpression);
    tap.same(results, data.store.book);
  });
  tap.test("member names with dots", async function () {
    var data = {
      "www.google.com": 42,
      "www.wikipedia.org": 190,
    };
    var results = jp.query(data, "$['www.google.com']");
    tap.same(results, [42]);
  });
  tap.test("nested objects with filter", async function () {
    var data = {
      dataResult: {
        object: {
          objectInfo: {
            className: "folder",
            typeName: "Standard Folder",
            id: "uniqueId",
          },
        },
      },
    };
    var results = jp.query(data, "$..object[?(@.className=='folder')]");
    tap.same(results, [data.dataResult.object.objectInfo]);
  });
  tap.test("script expressions with @ char", async function () {
    var data = {
      DIV: [
        {
          "@class": "value",
          val: 5,
        },
      ],
    };
    var results = jp.query(data, "$..DIV[?(@['@class']=='value')]");
    tap.same(results, data.DIV);
  });
  tap.test("negative slices", async function () {
    var results = jp.query(data, "$..book[-1:].title");
    tap.same(results, ["The Lord of the Rings"]);
  });
});
