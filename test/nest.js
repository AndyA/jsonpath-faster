"use strict";

const tap = require("tap");
const jp = require("..");
const { makeTerminal } = require("../lib/tokens");

tap.test(`conformance`, async () => {
  const obj = require("./upstream/data/store");
  const paths = require("./data/paths");

  const want = paths.flatMap(path => jp.nodes(obj, path));
  const mp = jp.nest();
  const got = [];
  for (const path of paths)
    mp.visitor(path, (value, path) => got.push({ value, path }));
  mp(obj);

  tap.same(got, want, `Nest`);
});

tap.test(`Nest`, async () => {
  tap.test(`Visitors and mutators`, async () => {
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
      },
      i: { was: { here: true } }
    };

    const mp = jp.nest();
    const before = [],
      after = [];

    mp.visitor("$..title", (value, path) => before.push({ value, path }))
      .mutator("$..title", (value, path) => jp.stringify(path))
      .mutator("$..links[*].url", value => "https://example.com" + value)
      .visitor("$..title", (value, path) => after.push({ value, path }))
      .mutator("$.they.were.here", false) // NOP - path !exists
      .setter("$.i.was.here", true); // vivify

    const $ = {};
    mp(obj, $);

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

  tap.test(`Actions`, async () => {
    const mp = jp.nest();

    mp.at("$.foo.bar", `$.log.push([@.value, @.path]);`)
      .at("$.foo.baz", `$.log.push([@.value]);`)
      .at("$.foo.bof[0].meta.control", `@.value = true;`)
      .at("$..*", `$.survey.push([@.pathString, @.leaf]);`);

    const obj = { foo: { bar: "Bar!", baz: "Baz!" } };
    const $ = { log: [], survey: [] };
    mp(obj, $);

    const want = {
      obj: {
        foo: { bar: "Bar!", baz: "Baz!", bof: [{ meta: { control: true } }] }
      },
      $: {
        log: [["Bar!", ["$", "foo", "bar"]], ["Baz!"]],
        survey: [
          ["$.foo.bar", "Bar!"],
          ["$.foo.baz", "Baz!"]
          // Not in the survey because it didn't exist
          //          ["$.foo.bof[0].meta.control", true]
        ]
      }
    };
    tap.same({ obj, $ }, want, `at`);
  });

  tap.test(`leaves`, async () => {
    const obj = { a: ["foo", "bar"], b: { c: [1, 2, 3] } };
    const leafLog = [],
      allLog = [];
    jp
      .nest()
      .leaf.visitor("$..*", (value, path) => leafLog.push(path))
      .visitor("$..*", (value, path) => allLog.push(path))(obj);

    const leafWant = [
      ["$", "a", 0],
      ["$", "a", 1],
      ["$", "b", "c", 0],
      ["$", "b", "c", 1],
      ["$", "b", "c", 2]
    ];

    const allWant = [
      ["$", "a"],
      ["$", "b"],
      ["$", "a", 0],
      ["$", "a", 1],
      ["$", "b", "c"],
      ["$", "b", "c", 0],
      ["$", "b", "c", 1],
      ["$", "b", "c", 2]
    ];

    tap.same(leafLog, leafWant, `leaf limiter`);
    tap.same(allLog, allWant, `leaf limiter - chains original`);
  });

  tap.test(`Natural ordering`, async () => {
    const nest = jp.nest();
    const paths = ["$.foo.bar", "$.foo.baz"];
    const obj = { foo: { bar: "Hello", baz: "Bye!" } };

    for (const path of paths) {
      const ast = jp.parse(path);
      nest.addTree([
        ...ast,
        makeTerminal(`$.log.push([@.value, @.pathString])`)
      ]);
    }

    const $ = { log: [] };
    nest(obj, $);
    const want = {
      log: [
        ["Hello", "$.foo.bar"],
        ["Bye!", "$.foo.baz"]
      ]
    };

    tap.same($, want, `natural ordering of Nest`);
  });

  tap.test(`Misc`, async () => {
    const mp = jp.nest().setter("$", {
      empty: false
    });
    const obj = mp(undefined);
    tap.same(obj, { empty: false }, `vivify root object`);
  });
});
