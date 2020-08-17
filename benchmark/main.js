"use strict";

const engine = require("../lib/engine");
const genfun = require("generate-function");
const jp = require("jsonpath");
const Benchmark = require("benchmark");

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
  //  "$..[(@.length-1)]", // All last elements
  "$..book[(@.length-1)]" // The last book via script subscript
  //  "$..book[?(@.isbn)]", // Filter all books with isbn number
  //  "$..book[?(@.price<10)]", // Filter all books cheaper than 10
  //  "$..book[?(@.price==8.95)]", // Filter all books that cost 8.95
  //  '$..book[?(@.price<30 && @.category=="fiction")]' // Filter all fiction books cheaper than 30
];

const func = (code, ctx) => {
  const gen = genfun();
  gen(`(obj, cb) => { ${code} }`);
  return gen.toFunction(ctx);
};

for (const path of paths) {
  const suite = new Benchmark.Suite();

  const [jpi, jpf] = [[], []];

  const code = engine.compile(path, {
    trackPath: true,
    lastly: ctx => `jpf.push({value: ${ctx.lval}, path});`
  });
  const f = func(code, { jpf });

  suite
    .add(`jp(${path})`, function() {
      jpi.push(jp.nodes(obj, path));
    })
    .add(`jpf(${path})`, function() {
      f(obj);
    });

  // add listeners
  suite
    .on("cycle", function(event) {
      console.log(`  ${event.target}`);
    })
    .on("complete", function() {
      //      this.forEach(r => console.log({ r }));
      console.log("Fastest is " + this.filter("fastest").map("name"));
    })
    .on("error", function(e) {
      console.error(e);
      process.exit(1);
    })
    .run();
}
