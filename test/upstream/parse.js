const tap = require("tap");
var assert = require("assert");
var jp = require("../../");
var util = require("util");
tap.test("parse", async function () {
  tap.test("should parse root-only", async function () {
    var path = jp.parse("$");
    tap.same(path, [
      {
        expression: {
          type: "root",
          value: "$",
        },
      },
    ]);
  });
  tap.test("parse path for store", async function () {
    var path = jp.parse("$.store");
    tap.same(path, [
      {
        expression: {
          type: "root",
          value: "$",
        },
      },
      {
        operation: "member",
        scope: "child",
        expression: {
          type: "identifier",
          value: "store",
        },
      },
    ]);
  });
  tap.test(
    "parse path for the authors of all books in the store",
    async function () {
      var path = jp.parse("$.store.book[*].author");
      tap.same(path, [
        {
          expression: {
            type: "root",
            value: "$",
          },
        },
        {
          operation: "member",
          scope: "child",
          expression: {
            type: "identifier",
            value: "store",
          },
        },
        {
          operation: "member",
          scope: "child",
          expression: {
            type: "identifier",
            value: "book",
          },
        },
        {
          operation: "subscript",
          scope: "child",
          expression: {
            type: "wildcard",
            value: "*",
          },
        },
        {
          operation: "member",
          scope: "child",
          expression: {
            type: "identifier",
            value: "author",
          },
        },
      ]);
    }
  );
  tap.test("parse path for all authors", async function () {
    var path = jp.parse("$..author");
    tap.same(path, [
      {
        expression: {
          type: "root",
          value: "$",
        },
      },
      {
        operation: "member",
        scope: "descendant",
        expression: {
          type: "identifier",
          value: "author",
        },
      },
    ]);
  });
  tap.test(
    "parse path for all authors via subscript descendant string literal",
    async function () {
      var path = jp.parse("$..['author']");
      tap.same(path, [
        {
          expression: {
            type: "root",
            value: "$",
          },
        },
        {
          operation: "subscript",
          scope: "descendant",
          expression: {
            type: "string_literal",
            value: "author",
          },
        },
      ]);
    }
  );
  tap.test("parse path for all things in store", async function () {
    var path = jp.parse("$.store.*");
    tap.same(path, [
      {
        expression: {
          type: "root",
          value: "$",
        },
      },
      {
        operation: "member",
        scope: "child",
        expression: {
          type: "identifier",
          value: "store",
        },
      },
      {
        operation: "member",
        scope: "child",
        expression: {
          type: "wildcard",
          value: "*",
        },
      },
    ]);
  });
  tap.test(
    "parse path for price of everything in the store",
    async function () {
      var path = jp.parse("$.store..price");
      tap.same(path, [
        {
          expression: {
            type: "root",
            value: "$",
          },
        },
        {
          operation: "member",
          scope: "child",
          expression: {
            type: "identifier",
            value: "store",
          },
        },
        {
          operation: "member",
          scope: "descendant",
          expression: {
            type: "identifier",
            value: "price",
          },
        },
      ]);
    }
  );
  tap.test(
    "parse path for the last book in order via expression",
    async function () {
      var path = jp.parse("$..book[(@.length-1)]");
      tap.same(path, [
        {
          expression: {
            type: "root",
            value: "$",
          },
        },
        {
          operation: "member",
          scope: "descendant",
          expression: {
            type: "identifier",
            value: "book",
          },
        },
        {
          operation: "subscript",
          scope: "child",
          expression: {
            type: "script_expression",
            value: "(@.length-1)",
          },
        },
      ]);
    }
  );
  tap.test("parse path for the first two books via union", async function () {
    var path = jp.parse("$..book[0,1]");
    tap.same(path, [
      {
        expression: {
          type: "root",
          value: "$",
        },
      },
      {
        operation: "member",
        scope: "descendant",
        expression: {
          type: "identifier",
          value: "book",
        },
      },
      {
        operation: "subscript",
        scope: "child",
        expression: {
          type: "union",
          value: [
            {
              expression: {
                type: "numeric_literal",
                value: "0",
              },
            },
            {
              expression: {
                type: "numeric_literal",
                value: "1",
              },
            },
          ],
        },
      },
    ]);
  });
  tap.test("parse path for the first two books via slice", async function () {
    var path = jp.parse("$..book[0:2]");
    tap.same(path, [
      {
        expression: {
          type: "root",
          value: "$",
        },
      },
      {
        operation: "member",
        scope: "descendant",
        expression: {
          type: "identifier",
          value: "book",
        },
      },
      {
        operation: "subscript",
        scope: "child",
        expression: {
          type: "slice",
          value: "0:2",
        },
      },
    ]);
  });
  tap.test(
    "parse path to filter all books with isbn number",
    async function () {
      var path = jp.parse("$..book[?(@.isbn)]");
      tap.same(path, [
        {
          expression: {
            type: "root",
            value: "$",
          },
        },
        {
          operation: "member",
          scope: "descendant",
          expression: {
            type: "identifier",
            value: "book",
          },
        },
        {
          operation: "subscript",
          scope: "child",
          expression: {
            type: "filter_expression",
            value: "?(@.isbn)",
          },
        },
      ]);
    }
  );
  tap.test(
    "parse path to filter all books with a price less than 10",
    async function () {
      var path = jp.parse("$..book[?(@.price<10)]");
      tap.same(path, [
        {
          expression: {
            type: "root",
            value: "$",
          },
        },
        {
          operation: "member",
          scope: "descendant",
          expression: {
            type: "identifier",
            value: "book",
          },
        },
        {
          operation: "subscript",
          scope: "child",
          expression: {
            type: "filter_expression",
            value: "?(@.price<10)",
          },
        },
      ]);
    }
  );
  tap.test("parse path to match all elements", async function () {
    var path = jp.parse("$..*");
    tap.same(path, [
      {
        expression: {
          type: "root",
          value: "$",
        },
      },
      {
        operation: "member",
        scope: "descendant",
        expression: {
          type: "wildcard",
          value: "*",
        },
      },
    ]);
  });
  tap.test("parse path with leading member", async function () {
    var path = jp.parse("store");
    tap.same(path, [
      {
        operation: "member",
        scope: "child",
        expression: {
          type: "identifier",
          value: "store",
        },
      },
    ]);
  });
  tap.test("parse path with leading member and followers", async function () {
    var path = jp.parse("Request.prototype.end");
    tap.same(path, [
      {
        operation: "member",
        scope: "child",
        expression: {
          type: "identifier",
          value: "Request",
        },
      },
      {
        operation: "member",
        scope: "child",
        expression: {
          type: "identifier",
          value: "prototype",
        },
      },
      {
        operation: "member",
        scope: "child",
        expression: {
          type: "identifier",
          value: "end",
        },
      },
    ]);
  });
  tap.test(
    "parser ast is reinitialized after parse() throws",
    async function () {
      tap.throws(function () {
        var path = jp.parse("store.book...");
      });
      var path = jp.parse("$..price");
      tap.same(path, [
        {
          expression: {
            type: "root",
            value: "$",
          },
        },
        {
          expression: {
            type: "identifier",
            value: "price",
          },
          operation: "member",
          scope: "descendant",
        },
      ]);
    }
  );
});
tap.test("parse-negative", async function () {
  tap.test(
    "parse path with leading member component throws",
    async function () {
      tap.throws(function (e) {
        var path = jp.parse(".store");
      }, /Expecting 'DOLLAR'/);
    }
  );
  tap.test(
    "parse path with leading descendant member throws",
    async function () {
      tap.throws(function () {
        var path = jp.parse("..store");
      }, /Expecting 'DOLLAR'/);
    }
  );
  tap.test("leading script throws", async function () {
    tap.throws(function () {
      var path = jp.parse("()");
    }, /Unrecognized text/);
  });
  tap.test("first time friendly error", async function () {
    this.skip();
    tap.throws(function () {
      new jp.JSONPath().parse("$...");
    }, /Expecting 'STAR'/);
  });
});
