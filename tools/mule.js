"use strict";

const inspect = require("../lib/inspect");
const jp = require("..");
const prettier = require("prettier");

const data = require("../test/upstream/data/store");

const showCode = code => {
  const pretty = prettier.format(`module.exports = ${code}`, {
    filepath: "code.js"
  });
  console.log(pretty);
};

const survey = [];
const authors = [];
const nest = jp.nest();
//nest
//  .visitor("$..*", (value, path) => survey.push({ value, path }))
//  .visitor("$..author", value => authors.push(value))
//  .mutator("$..price", value => value * 1.1);

nest
  .visitor("$.assets[*]..meta.id", value => {})
  .visitor("$.assets[*]..meta.author", value => {})
  .visitor("$.assets[*]..meta.modified", value => {});

//nest(data);
//console.log(inspect(data));

//const nest = jp.string.nest();

//nest.interior.visitor("$..*", value => console.log(value));
//nest.leaf.visitor("$..*", (value, path) => console.log(`${path}: ${value}`));

//nest(data);
//console.log(survey, authors);

//showCode(nest.code());

//nest
//  .mutator("$..thing.seen", true)
//  .visitor("$..seen", (value, path) => console.log(`Seen at ${path}`));

nest.leaf.string.visitor("$..*", (value, path) =>
  console.log(`${path}: ${value}`)
);

nest(data);
