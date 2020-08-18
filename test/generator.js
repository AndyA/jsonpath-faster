"use strict";

const tap = require("tap");
const genfun = require("generate-function");
const jp = require("jsonpath");

const selectorCompiler = require("../lib/compilers/selectors");
const callbackCompiler = require("../lib/compilers/callback");
const generatorCompiler = require("../lib/compilers/generator");
const lib = require("../lib/compilers/lib");
const Compiler = require("../lib/compiler");

const engine = new Compiler(generatorCompiler, selectorCompiler, lib);

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
  //  "$..book[0,1]", // The first two books via subscript union
  "$..book[-1:]", // The last book via slice
  "$..book[:2]", // The first two books via subscript array slice
  "$..book[::-2]", // Every other book backwards
  "$..book[(@.length-1)]", // The last book via script subscript
  "$..book[?(@.isbn)]", // Filter all books with isbn number
  "$..book[?(@.price<10)]", // Filter all books cheaper than 10
  "$..book[?(@.price==8.95)]", // Filter all books that cost 8.95
  '$..book[?(@.price<30 && @.category=="fiction")]', // Filter all fiction books cheaper than 30
  "$..[?(@.price)]" // Everything with a price

  // jsonpath falls over this
  //  "$..[(@.length-1)]", // All last elements
];

const func = (code, ctx) => {
  const gen = genfun();
  gen(`function* (obj) { ${code} }`);
  return gen.toFunction(ctx);
};

for (const path of paths) {
  const code = engine.compile(path, {
    trackPath: true,
    lastly: ctx => `yield {value: ${ctx.lval}, path}`
  });

  const f = func(code);
  const got = [];
  for (const hit of f(obj)) got.push(hit);

  const ref = jp.nodes(obj, path);

  tap.same(got, ref, `nodes of ${path}`);
}