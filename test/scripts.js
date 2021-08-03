"use strict";

const tap = require("tap");
const genfun = require("generate-function");
const { bindScript, bindFilter } = require("../lib/scripts");

const js = obj => JSON.stringify(obj);

const runExpr = (expr, lval, $) =>
  genfun()(`(lval, $) => ${bindScript(expr, "lval")}`).toFunction()(lval, $);

const positive = [
  { expr: "@.length-1", cases: [{ lval: [1, 2, 3], want: 2 }] },
  {
    expr: "@.isbn",
    cases: [
      { lval: { isbn: "123" }, want: "123" },
      { lval: {}, want: undefined }
    ]
  },
  {
    expr: "@.price<10",
    cases: [
      { lval: { price: 3 }, want: true },
      { lval: { price: 30 }, want: false }
    ]
  },
  { expr: "@.price==8.95", cases: [{ lval: { price: 8.95 }, want: true }] },
  {
    expr: '@.price<30 && @.category=="fiction"',
    cases: [
      { lval: { price: 10, category: "fiction" }, want: true },
      { lval: { price: 300, category: "fiction" }, want: false },
      { lval: { price: 10, category: "biography" }, want: false }
    ]
  },
  { expr: "@.price", cases: [{ lval: { price: 123 }, want: 123 }] },
  { expr: '@["@price"]', cases: [{ lval: { ["@price"]: 12.3 }, want: 12.3 }] },
  {
    expr: '@[`@${"price"}`]',
    cases: [{ lval: { ["@price"]: 12.3 }, want: 12.3 }]
  },
  {
    expr: "@[@.sel]",
    cases: [
      { lval: { sel: "a", a: "A", b: "B" }, want: "A" },
      { lval: { sel: "b", a: "A", b: "B" }, want: "B" },
      { lval: { sel: "c", a: "A", b: "B" }, want: undefined },
      { lval: { sel: "sel", a: "A", b: "B" }, want: "sel" }
    ]
  },
  {
    expr: "@[$.sel]",
    cases: [
      { lval: { a: "A", b: "B" }, $: { sel: "a" }, want: "A" },
      { lval: { a: "A", b: "B" }, $: { sel: "b" }, want: "B" },
      { lval: { a: "A", b: "B" }, $: { sel: "c" }, want: undefined }
    ]
  }
  // Nice to have but beware the pathologies of REs.
  //  { expr: "/foo/.test(@.name)", cases: [{ lval: { name: "foo" }, want: true }] }
];

for (const { expr, cases } of positive) {
  for (const { lval, $, want } of cases) {
    const got = runExpr(expr, lval, $);
    tap.same(
      got,
      want,
      `${expr} @=${js(lval)} ${$ && `$=${js($)}`}} => ${js(want)}`
    );
  }
}

const tryExpr = (expr, lval, $) => {
  try {
    return runExpr(expr, lval, $);
  } catch (e) {
    //    console.error(e.message);
    throw e;
  }
};

const negative = [
  { expr: "process.exit()", want: /bad node/i },
  { expr: "// oof!", want: /no code/i },
  { expr: "BAD SYNTAX!", want: /./ },
  { expr: "foo.bar", want: /bad node/i },
  { expr: "break", want: /illegal/i },
  { expr: "continue", want: /illegal/i },
  { expr: "return", want: /illegal/i },
  { expr: 'throw new Error("Help!")', want: /bad node/i },
  { expr: "foo.@", want: /bad node/i },
  { expr: "/foo/.test(@.name)", want: /bad node/i },
  { expr: "foo", want: /bad node/i }
];

for (const { expr, want } of negative)
  tap.throws(() => tryExpr(expr, []), want, `"${expr}" throws ${want}`);

tap.test(`errors`, async () => {
  tap.throws(
    () => bindFilter("?("),
    /parse filter/i,
    `bindFilter() throws on bad input`
  );
});
