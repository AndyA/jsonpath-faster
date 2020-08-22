// automatically translated from node_modules/jsonpath/test/slice.js
const tap = require("tap");
var assert = require("assert");
var slice = require("../../lib/slice");
var data = ["a", "b", "c", "d", "e", "f"];
tap.test("slice", async function () {
  tap.test("no params yields copy", async function () {
    tap.same(slice(data), data);
  });
  tap.test("no end param defaults to end", async function () {
    tap.same(slice(data, 2), data.slice(2));
  });
  tap.test("zero end param yields empty", async function () {
    tap.same(slice(data, 0, 0), []);
  });
  tap.test("first element with explicit params", async function () {
    tap.same(slice(data, 0, 1, 1), ["a"]);
  });
  tap.test("last element with explicit params", async function () {
    tap.same(slice(data, -1, 6), ["f"]);
  });
  tap.test("empty extents and negative step reverses", async function () {
    tap.same(slice(data, null, null, -1), ["f", "e", "d", "c", "b", "a"]);
  });
  tap.test("negative step partial slice", async function () {
    tap.same(slice(data, 4, 2, -1), ["e", "d"]);
  });
  tap.test(
    "negative step partial slice no start defaults to end",
    async function () {
      tap.same(slice(data, null, 2, -1), ["f", "e", "d"]);
    }
  );
  tap.test("extents clamped end", async function () {
    tap.same(slice(data, null, 100), data);
  });
  tap.test("extents clamped beginning", async function () {
    tap.same(slice(data, -100, 100), data);
  });
  tap.test("backwards extents yields empty", async function () {
    tap.same(slice(data, 2, 1), []);
  });
  tap.test("zero step gets shot down", async function () {
    tap.throws(function () {
      slice(data, null, null, 0);
    });
  });
});
