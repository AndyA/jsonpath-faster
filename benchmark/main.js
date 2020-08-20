"use strict";

const genfun = require("generate-function");
const jp = require("jsonpath");
const jpc = require("..");
const Benchmark = require("benchmark");

const engine = require("../lib/engine");

const obj = {
  store: {
    book: [
      {
        category: "reference",
        author: "Nigel Rees",
        title: "Sayings of the Century",
        price: 8.95
      },
      {
        category: "fiction",
        author: "Evelyn Waugh",
        title: "Sword of Honour",
        price: 12.99
      },
      {
        category: "fiction",
        author: "Herman Melville",
        title: "Moby Dick",
        isbn: "0-553-21311-3",
        price: 8.99
      },
      {
        category: "fiction",
        author: "J. R. R. Tolkien",
        title: "The Lord of the Rings",
        isbn: "0-395-19395-8",
        price: 22.99
      }
    ],
    bicycle: { color: "red", price: 19.95 }
  }
};

const paths = [
  "$.*",
  "$..*", // All members of JSON structure
  "$.store",
  "$.store.bicycle",
  '$.store.bicycle["color"]',
  "$.store.*", // All things in store, which are some books and a red bicycle
  "$.store[*]", // All things in store, which are some books and a red bicycle
  "$.store.book[1]",
  "$.store.book.1",
  "$.store.book[*].author", // The authors of all books in the store
  "$..author", // All authors
  "$..[1]", // All second elements
  "$.store..price", // The price of everything in the store
  "$..book[2]", // The third book
  "$..book[0,1]", // The first two books via subscript union
  "$..book[-1:]", // The last book via slice
  "$..book[:2]", // The first two books via subscript array slice
  "$..book[(@.length-1)]", // The last book via script subscript

  "$..book[?(@.isbn)]", // Filter all books with isbn number
  "$..book[?(@.price<10)]", // Filter all books cheaper than 10
  "$..book[?(@.price==8.95)]", // Filter all books that cost 8.95
  '$..book[?(@.price<30 && @.category=="fiction")]' // Filter all fiction books cheaper than 30

  //  jsonpath can't handle this
  //  "$..[(@.length-1)]", // All last elements
];

const reporter = sendLine => {
  const splitName = name => {
    const [n, ...rest] = name.split(/\s+/);
    return [n, rest.join(" ")];
  };

  const cols = new Set();
  let needHeader = true;

  return res => {
    const tests = new Set();
    const rec = {};
    res.forEach(r => {
      const [col, test] = splitName(r.name);
      cols.add(col);
      tests.add(test);
      rec[col] = r;
    });
    if (tests.size > 1)
      throw new Error(`Multiple tests: ${[...tests].join(", ")}`);
    if (needHeader) {
      sendLine(["", ...cols]);
      needHeader = false;
    }
    sendLine([...tests, ...[...cols].map(col => rec[col].hz)]);
  };
};

const rep = reporter(row => console.log(row.map(c => `"${c}"`).join(",")));

for (const path of paths) {
  for (const method of ["query", "paths", "nodes"]) {
    for (const count of [undefined, 1, 3, 100000]) {
      const suite = new Benchmark.Suite();

      const [jpi, jpf] = [[], []];

      const name = `${path} ${method} ${count === undefined ? "∞" : count}`;

      suite
        .add(`jp ${name}`, function() {
          jpi.push(jp[method](obj, path, count));
        })
        .add(`jpf ${name}`, function() {
          jpf.push(jpc[method](obj, path, count));
        });

      // add listeners
      suite
        .on("cycle", function(event) {
          console.error(`  ${event.target}`);
        })
        .on("complete", function() {
          rep(this);
        })
        .on("error", function(e) {
          console.error(e);
          process.exit(1);
        })
        .run();
    }
  }
}
