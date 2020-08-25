"use strict";

const tap = require("tap");
const jp = require("..");
const { MultiPath } = require("../lib/multipath");

tap.test(`conformance`, async () => {
  const obj = require("./upstream/data/store");
  const paths = require("./data/paths");

  const want = paths.flatMap(path => jp.nodes(obj, path));
  const mp = new MultiPath();
  const got = [];
  for (const path of paths)
    mp.addVisitor(path, (value, path) => got.push({ value, path }));
  mp.compile()(obj);

  tap.same(got, want, `MultiPath`);
});

tap.test(`mutator`, async () => {
  const obj = {
    page: {
      body: {},
      header: {
        links: [
          { url: "/", title: "home" },
          { url: "/about", title: "about" }
        ]
      }
    }
  };

  const want = {
    page: {
      body: {},
      header: {
        links: [
          {
            url: "https://example.com/",
            title: "$.page.header.links[0].title"
          },
          {
            url: "https://example.com/about",
            title: "$.page.header.links[1].title"
          }
        ]
      }
    }
  };

  const mp = new MultiPath();
  mp.addMutator("$..title", (value, path) => jp.stringify(path));
  mp.addMutator(
    "$..links[*].url",
    (value, path) => "https://example.com" + value
  );
  mp.compile()(obj);
  tap.same(obj, want, `mutated`);
});
