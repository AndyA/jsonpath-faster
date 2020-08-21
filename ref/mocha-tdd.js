// Mocha stuff
var assert = require("assert");
var jp = require("../");

var data = require("./data/store.json");

suite("query", async function() {
  test("first-level member", function() {
    var results = jp.nodes(data, "$.store");
    assert.deepEqual(results, [{ path: ["$", "store"], value: data.store }]);
  });

  test("authors of all books in the store", function() {
    var results = jp.nodes(data, "$.store.book[*].author");
    // Should have them all
    assert.deepEqual(results, [
      { path: ["$", "store", "book", 0, "author"], value: "Nigel Rees" },
      { path: ["$", "store", "book", 1, "author"], value: "Evelyn Waugh" },
      { path: ["$", "store", "book", 2, "author"], value: "Herman Melville" },
      { path: ["$", "store", "book", 3, "author"], value: "J. R. R. Tolkien" }
    ]);
  });
});
