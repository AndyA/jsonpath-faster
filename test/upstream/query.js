const tap = require("tap");
var assert = require("assert");
var jp = require("../../");
var data = require("./data/store.json");
tap.test("query", async function () {
  tap.test("first-level member", async function () {
    var results = jp.nodes(data, "$.store");
    tap.same(results, [
      {
        path: ["$", "store"],
        value: data.store,
      },
    ]);
  });
  tap.test("authors of all books in the store", async function () {
    var results = jp.nodes(data, "$.store.book[*].author");
    tap.same(results, [
      {
        path: ["$", "store", "book", 0, "author"],
        value: "Nigel Rees",
      },
      {
        path: ["$", "store", "book", 1, "author"],
        value: "Evelyn Waugh",
      },
      {
        path: ["$", "store", "book", 2, "author"],
        value: "Herman Melville",
      },
      {
        path: ["$", "store", "book", 3, "author"],
        value: "J. R. R. Tolkien",
      },
    ]);
  });
  tap.test("all authors", async function () {
    var results = jp.nodes(data, "$..author");
    tap.same(results, [
      {
        path: ["$", "store", "book", 0, "author"],
        value: "Nigel Rees",
      },
      {
        path: ["$", "store", "book", 1, "author"],
        value: "Evelyn Waugh",
      },
      {
        path: ["$", "store", "book", 2, "author"],
        value: "Herman Melville",
      },
      {
        path: ["$", "store", "book", 3, "author"],
        value: "J. R. R. Tolkien",
      },
    ]);
  });
  tap.test(
    "all authors via subscript descendant string literal",
    async function () {
      var results = jp.nodes(data, "$..['author']");
      tap.same(results, [
        {
          path: ["$", "store", "book", 0, "author"],
          value: "Nigel Rees",
        },
        {
          path: ["$", "store", "book", 1, "author"],
          value: "Evelyn Waugh",
        },
        {
          path: ["$", "store", "book", 2, "author"],
          value: "Herman Melville",
        },
        {
          path: ["$", "store", "book", 3, "author"],
          value: "J. R. R. Tolkien",
        },
      ]);
    }
  );
  tap.test("all things in store", async function () {
    var results = jp.nodes(data, "$.store.*");
    tap.same(results, [
      {
        path: ["$", "store", "book"],
        value: data.store.book,
      },
      {
        path: ["$", "store", "bicycle"],
        value: data.store.bicycle,
      },
    ]);
  });
  tap.test("price of everything in the store", async function () {
    var results = jp.nodes(data, "$.store..price");
    tap.same(results, [
      {
        path: ["$", "store", "book", 0, "price"],
        value: 8.95,
      },
      {
        path: ["$", "store", "book", 1, "price"],
        value: 12.99,
      },
      {
        path: ["$", "store", "book", 2, "price"],
        value: 8.99,
      },
      {
        path: ["$", "store", "book", 3, "price"],
        value: 22.99,
      },
      {
        path: ["$", "store", "bicycle", "price"],
        value: 19.95,
      },
    ]);
  });
  tap.test("last book in order via expression", async function () {
    var results = jp.nodes(data, "$..book[(@.length-1)]");
    tap.same(results, [
      {
        path: ["$", "store", "book", 3],
        value: data.store.book[3],
      },
    ]);
  });
  tap.test("first two books via union", async function () {
    var results = jp.nodes(data, "$..book[0,1]");
    tap.same(results, [
      {
        path: ["$", "store", "book", 0],
        value: data.store.book[0],
      },
      {
        path: ["$", "store", "book", 1],
        value: data.store.book[1],
      },
    ]);
  });
  tap.test("first two books via slice", async function () {
    var results = jp.nodes(data, "$..book[0:2]");
    tap.same(results, [
      {
        path: ["$", "store", "book", 0],
        value: data.store.book[0],
      },
      {
        path: ["$", "store", "book", 1],
        value: data.store.book[1],
      },
    ]);
  });
  tap.test("filter all books with isbn number", async function () {
    var results = jp.nodes(data, "$..book[?(@.isbn)]");
    tap.same(results, [
      {
        path: ["$", "store", "book", 2],
        value: data.store.book[2],
      },
      {
        path: ["$", "store", "book", 3],
        value: data.store.book[3],
      },
    ]);
  });
  tap.test("filter all books with a price less than 10", async function () {
    var results = jp.nodes(data, "$..book[?(@.price<10)]");
    tap.same(results, [
      {
        path: ["$", "store", "book", 0],
        value: data.store.book[0],
      },
      {
        path: ["$", "store", "book", 2],
        value: data.store.book[2],
      },
    ]);
  });
  tap.test("first ten of all elements", async function () {
    var results = jp.nodes(data, "$..*", 10);
    tap.same(results, [
      {
        path: ["$", "store"],
        value: data.store,
      },
      {
        path: ["$", "store", "book"],
        value: data.store.book,
      },
      {
        path: ["$", "store", "bicycle"],
        value: data.store.bicycle,
      },
      {
        path: ["$", "store", "book", 0],
        value: data.store.book[0],
      },
      {
        path: ["$", "store", "book", 1],
        value: data.store.book[1],
      },
      {
        path: ["$", "store", "book", 2],
        value: data.store.book[2],
      },
      {
        path: ["$", "store", "book", 3],
        value: data.store.book[3],
      },
      {
        path: ["$", "store", "book", 0, "category"],
        value: "reference",
      },
      {
        path: ["$", "store", "book", 0, "author"],
        value: "Nigel Rees",
      },
      {
        path: ["$", "store", "book", 0, "title"],
        value: "Sayings of the Century",
      },
    ]);
  });
  tap.test("all elements", async function () {
    var results = jp.nodes(data, "$..*");
    tap.same(results, [
      {
        path: ["$", "store"],
        value: data.store,
      },
      {
        path: ["$", "store", "book"],
        value: data.store.book,
      },
      {
        path: ["$", "store", "bicycle"],
        value: data.store.bicycle,
      },
      {
        path: ["$", "store", "book", 0],
        value: data.store.book[0],
      },
      {
        path: ["$", "store", "book", 1],
        value: data.store.book[1],
      },
      {
        path: ["$", "store", "book", 2],
        value: data.store.book[2],
      },
      {
        path: ["$", "store", "book", 3],
        value: data.store.book[3],
      },
      {
        path: ["$", "store", "book", 0, "category"],
        value: "reference",
      },
      {
        path: ["$", "store", "book", 0, "author"],
        value: "Nigel Rees",
      },
      {
        path: ["$", "store", "book", 0, "title"],
        value: "Sayings of the Century",
      },
      {
        path: ["$", "store", "book", 0, "price"],
        value: 8.95,
      },
      {
        path: ["$", "store", "book", 1, "category"],
        value: "fiction",
      },
      {
        path: ["$", "store", "book", 1, "author"],
        value: "Evelyn Waugh",
      },
      {
        path: ["$", "store", "book", 1, "title"],
        value: "Sword of Honour",
      },
      {
        path: ["$", "store", "book", 1, "price"],
        value: 12.99,
      },
      {
        path: ["$", "store", "book", 2, "category"],
        value: "fiction",
      },
      {
        path: ["$", "store", "book", 2, "author"],
        value: "Herman Melville",
      },
      {
        path: ["$", "store", "book", 2, "title"],
        value: "Moby Dick",
      },
      {
        path: ["$", "store", "book", 2, "isbn"],
        value: "0-553-21311-3",
      },
      {
        path: ["$", "store", "book", 2, "price"],
        value: 8.99,
      },
      {
        path: ["$", "store", "book", 3, "category"],
        value: "fiction",
      },
      {
        path: ["$", "store", "book", 3, "author"],
        value: "J. R. R. Tolkien",
      },
      {
        path: ["$", "store", "book", 3, "title"],
        value: "The Lord of the Rings",
      },
      {
        path: ["$", "store", "book", 3, "isbn"],
        value: "0-395-19395-8",
      },
      {
        path: ["$", "store", "book", 3, "price"],
        value: 22.99,
      },
      {
        path: ["$", "store", "bicycle", "color"],
        value: "red",
      },
      {
        path: ["$", "store", "bicycle", "price"],
        value: 19.95,
      },
    ]);
  });
  tap.test("all elements via subscript wildcard", async function () {
    var results = jp.nodes(data, "$..*");
    tap.same(jp.nodes(data, "$..[*]"), jp.nodes(data, "$..*"));
  });
  tap.test("object subscript wildcard", async function () {
    var results = jp.query(data, "$.store[*]");
    tap.same(results, [data.store.book, data.store.bicycle]);
  });
  tap.test("no match returns empty array", async function () {
    var results = jp.nodes(data, "$..bookz");
    tap.same(results, []);
  });
  tap.test("member numeric literal gets first element", async function () {
    var results = jp.nodes(data, "$.store.book.0");
    tap.same(results, [
      {
        path: ["$", "store", "book", 0],
        value: data.store.book[0],
      },
    ]);
  });
  tap.test(
    "member numeric literal matches string-numeric key",
    async function () {
      var data = {
        authors: {
          "1": "Herman Melville",
          "2": "J. R. R. Tolkien",
        },
      };
      var results = jp.nodes(data, "$.authors.1");
      tap.same(results, [
        {
          path: ["$", "authors", 1],
          value: "Herman Melville",
        },
      ]);
    }
  );
  tap.test("descendant numeric literal gets first element", async function () {
    var results = jp.nodes(data, "$.store.book..0");
    tap.same(results, [
      {
        path: ["$", "store", "book", 0],
        value: data.store.book[0],
      },
    ]);
  });
  tap.test("root element gets us original obj", async function () {
    var results = jp.nodes(data, "$");
    tap.same(results, [
      {
        path: ["$"],
        value: data,
      },
    ]);
  });
  tap.test("subscript double-quoted string", async function () {
    var results = jp.nodes(data, '$["store"]');
    tap.same(results, [
      {
        path: ["$", "store"],
        value: data.store,
      },
    ]);
  });
  tap.test("subscript single-quoted string", async function () {
    var results = jp.nodes(data, "$['store']");
    tap.same(results, [
      {
        path: ["$", "store"],
        value: data.store,
      },
    ]);
  });
  tap.test("leading member component", async function () {
    this.skip();
    var results = jp.nodes(data, "store");
    tap.same(results, [
      {
        path: ["$", "store"],
        value: data.store,
      },
    ]);
  });
  tap.test("union of three array slices", async function () {
    var results = jp.query(data, "$.store.book[0:1,1:2,2:3]");
    tap.same(results, data.store.book.slice(0, 3));
  });
  tap.test("slice with step > 1", async function () {
    var results = jp.query(data, "$.store.book[0:4:2]");
    tap.same(results, [data.store.book[0], data.store.book[2]]);
  });
  tap.test("union of subscript string literal keys", async function () {
    var results = jp.nodes(data, "$.store['book','bicycle']");
    tap.same(results, [
      {
        path: ["$", "store", "book"],
        value: data.store.book,
      },
      {
        path: ["$", "store", "bicycle"],
        value: data.store.bicycle,
      },
    ]);
  });
  tap.test("union of subscript string literal three keys", async function () {
    var results = jp.nodes(data, "$.store.book[0]['title','author','price']");
    tap.same(results, [
      {
        path: ["$", "store", "book", 0, "title"],
        value: data.store.book[0].title,
      },
      {
        path: ["$", "store", "book", 0, "author"],
        value: data.store.book[0].author,
      },
      {
        path: ["$", "store", "book", 0, "price"],
        value: data.store.book[0].price,
      },
    ]);
  });
  tap.test(
    "union of subscript integer three keys followed by member-child-identifier",
    async function () {
      var results = jp.nodes(data, "$.store.book[1,2,3]['title']");
      tap.same(results, [
        {
          path: ["$", "store", "book", 1, "title"],
          value: data.store.book[1].title,
        },
        {
          path: ["$", "store", "book", 2, "title"],
          value: data.store.book[2].title,
        },
        {
          path: ["$", "store", "book", 3, "title"],
          value: data.store.book[3].title,
        },
      ]);
    }
  );
  tap.test(
    "union of subscript integer three keys followed by union of subscript string literal three keys",
    async function () {
      var results = jp.nodes(
        data,
        "$.store.book[0,1,2,3]['title','author','price']"
      );
      tap.same(results, [
        {
          path: ["$", "store", "book", 0, "title"],
          value: data.store.book[0].title,
        },
        {
          path: ["$", "store", "book", 0, "author"],
          value: data.store.book[0].author,
        },
        {
          path: ["$", "store", "book", 0, "price"],
          value: data.store.book[0].price,
        },
        {
          path: ["$", "store", "book", 1, "title"],
          value: data.store.book[1].title,
        },
        {
          path: ["$", "store", "book", 1, "author"],
          value: data.store.book[1].author,
        },
        {
          path: ["$", "store", "book", 1, "price"],
          value: data.store.book[1].price,
        },
        {
          path: ["$", "store", "book", 2, "title"],
          value: data.store.book[2].title,
        },
        {
          path: ["$", "store", "book", 2, "author"],
          value: data.store.book[2].author,
        },
        {
          path: ["$", "store", "book", 2, "price"],
          value: data.store.book[2].price,
        },
        {
          path: ["$", "store", "book", 3, "title"],
          value: data.store.book[3].title,
        },
        {
          path: ["$", "store", "book", 3, "author"],
          value: data.store.book[3].author,
        },
        {
          path: ["$", "store", "book", 3, "price"],
          value: data.store.book[3].price,
        },
      ]);
    }
  );
  tap.test(
    "union of subscript integer four keys, including an inexistent one, followed by union of subscript string literal three keys",
    async function () {
      var results = jp.nodes(
        data,
        "$.store.book[0,1,2,3,151]['title','author','price']"
      );
      tap.same(results, [
        {
          path: ["$", "store", "book", 0, "title"],
          value: data.store.book[0].title,
        },
        {
          path: ["$", "store", "book", 0, "author"],
          value: data.store.book[0].author,
        },
        {
          path: ["$", "store", "book", 0, "price"],
          value: data.store.book[0].price,
        },
        {
          path: ["$", "store", "book", 1, "title"],
          value: data.store.book[1].title,
        },
        {
          path: ["$", "store", "book", 1, "author"],
          value: data.store.book[1].author,
        },
        {
          path: ["$", "store", "book", 1, "price"],
          value: data.store.book[1].price,
        },
        {
          path: ["$", "store", "book", 2, "title"],
          value: data.store.book[2].title,
        },
        {
          path: ["$", "store", "book", 2, "author"],
          value: data.store.book[2].author,
        },
        {
          path: ["$", "store", "book", 2, "price"],
          value: data.store.book[2].price,
        },
        {
          path: ["$", "store", "book", 3, "title"],
          value: data.store.book[3].title,
        },
        {
          path: ["$", "store", "book", 3, "author"],
          value: data.store.book[3].author,
        },
        {
          path: ["$", "store", "book", 3, "price"],
          value: data.store.book[3].price,
        },
      ]);
    }
  );
  tap.test(
    "union of subscript integer three keys followed by union of subscript string literal three keys, followed by inexistent literal key",
    async function () {
      var results = jp.nodes(
        data,
        "$.store.book[0,1,2,3]['title','author','price','fruit']"
      );
      tap.same(results, [
        {
          path: ["$", "store", "book", 0, "title"],
          value: data.store.book[0].title,
        },
        {
          path: ["$", "store", "book", 0, "author"],
          value: data.store.book[0].author,
        },
        {
          path: ["$", "store", "book", 0, "price"],
          value: data.store.book[0].price,
        },
        {
          path: ["$", "store", "book", 1, "title"],
          value: data.store.book[1].title,
        },
        {
          path: ["$", "store", "book", 1, "author"],
          value: data.store.book[1].author,
        },
        {
          path: ["$", "store", "book", 1, "price"],
          value: data.store.book[1].price,
        },
        {
          path: ["$", "store", "book", 2, "title"],
          value: data.store.book[2].title,
        },
        {
          path: ["$", "store", "book", 2, "author"],
          value: data.store.book[2].author,
        },
        {
          path: ["$", "store", "book", 2, "price"],
          value: data.store.book[2].price,
        },
        {
          path: ["$", "store", "book", 3, "title"],
          value: data.store.book[3].title,
        },
        {
          path: ["$", "store", "book", 3, "author"],
          value: data.store.book[3].author,
        },
        {
          path: ["$", "store", "book", 3, "price"],
          value: data.store.book[3].price,
        },
      ]);
    }
  );
  tap.test(
    "union of subscript 4 array slices followed by union of subscript string literal three keys",
    async function () {
      var results = jp.nodes(
        data,
        "$.store.book[0:1,1:2,2:3,3:4]['title','author','price']"
      );
      tap.same(results, [
        {
          path: ["$", "store", "book", 0, "title"],
          value: data.store.book[0].title,
        },
        {
          path: ["$", "store", "book", 0, "author"],
          value: data.store.book[0].author,
        },
        {
          path: ["$", "store", "book", 0, "price"],
          value: data.store.book[0].price,
        },
        {
          path: ["$", "store", "book", 1, "title"],
          value: data.store.book[1].title,
        },
        {
          path: ["$", "store", "book", 1, "author"],
          value: data.store.book[1].author,
        },
        {
          path: ["$", "store", "book", 1, "price"],
          value: data.store.book[1].price,
        },
        {
          path: ["$", "store", "book", 2, "title"],
          value: data.store.book[2].title,
        },
        {
          path: ["$", "store", "book", 2, "author"],
          value: data.store.book[2].author,
        },
        {
          path: ["$", "store", "book", 2, "price"],
          value: data.store.book[2].price,
        },
        {
          path: ["$", "store", "book", 3, "title"],
          value: data.store.book[3].title,
        },
        {
          path: ["$", "store", "book", 3, "author"],
          value: data.store.book[3].author,
        },
        {
          path: ["$", "store", "book", 3, "price"],
          value: data.store.book[3].price,
        },
      ]);
    }
  );
  tap.test("nested parentheses eval", async function () {
    var pathExpression = "$..book[?( @.price && (@.price + 20 || false) )]";
    var results = jp.query(data, pathExpression);
    tap.same(results, data.store.book);
  });
  tap.test("array indexes from 0 to 100", async function () {
    var data = [];
    for (var i = 0; i <= 100; ++i) data[i] = Math.random();
    for (var i = 0; i <= 100; ++i) {
      var results = jp.query(data, "$[" + i.toString() + "]");
      tap.same(results, [data[i]]);
    }
  });
  tap.test("descendant subscript numeric literal", async function () {
    var data = [0, [1, 2, 3], [4, 5, 6]];
    var results = jp.query(data, "$..[0]");
    tap.same(results, [0, 1, 4]);
  });
  tap.test("descendant subscript numeric literal", async function () {
    var data = [0, 1, [2, 3, 4], [5, 6, 7, [8, 9, 10]]];
    var results = jp.query(data, "$..[0,1]");
    tap.same(results, [0, 1, 2, 3, 5, 6, 8, 9]);
  });
  tap.test("throws for no input", async function () {
    this.skip();
    tap.throws(function () {
      jp.query();
    }, /needs to be an object/);
  });
  tap.test("throws for bad input", async function () {
    this.skip();
    tap.throws(function () {
      jp.query("string", "string");
    }, /needs to be an object/);
  });
  tap.test("throws for bad input", async function () {
    tap.throws(function () {
      jp.query({}, null);
    }, /we need a path/);
  });
  tap.test("throws for bad input", async function () {
    tap.throws(function () {
      jp.query({}, 42);
    }, /we need a path/);
  });
  tap.test("union on objects", async function () {
    tap.same(
      jp.query(
        {
          a: 1,
          b: 2,
          c: null,
        },
        '$..["a","b","c","d"]'
      ),
      [1, 2, null]
    );
  });
});
