"use strict";

const jp = require("..");
const prettier = require("prettier");

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
  '$..book[?(@.price<30 && @.category=="fiction")]', // Filter all fiction books cheaper than 30

  //  jsonpath can't handle this
  "$..[(@.length-1)]", // All last elements

  "$..1",
  "$..[?(@isbn)]",
  "$..[::-1]",
  '$..["foo"]',
  "$..[0,1]",
  "$..[*]"
];

const stash = [];

for (const path of paths) {
  const ast = jp.parse(path);
  stash.push({ path, ast });
}

const pretty = prettier.format(`module.exports = ${JSON.stringify(stash)}`, {
  filepath: "code.js"
});
console.log(pretty);
