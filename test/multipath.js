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

tap.test(`MultiPath`, async () => {
  const obj = {
    page: {
      body: { title: "All about me!" },
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
      body: { title: "$.page.body.title" },
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
  const before = [],
    after = [];

  mp.addVisitor("$..title", (value, path) => before.push({ value, path }))
    .addMutator("$..title", (value, path) => jp.stringify(path))
    .addMutator(
      "$..links[*].url",
      (value, path) => "https://example.com" + value
    )
    .addVisitor("$..title", (value, path) => after.push({ value, path }));

  mp.compile()(obj);

  tap.same(obj, want, `mutated`);

  const want2 = {
    before: [
      { value: "All about me!", path: ["$", "page", "body", "title"] },
      { value: "home", path: ["$", "page", "header", "links", 0, "title"] },
      { value: "about", path: ["$", "page", "header", "links", 1, "title"] }
    ],
    after: [
      { value: "$.page.body.title", path: ["$", "page", "body", "title"] },
      {
        value: "$.page.header.links[0].title",
        path: ["$", "page", "header", "links", 0, "title"]
      },
      {
        value: "$.page.header.links[1].title",
        path: ["$", "page", "header", "links", 1, "title"]
      }
    ]
  };

  tap.same({ before, after }, want2, `visit order preserved`);
});
