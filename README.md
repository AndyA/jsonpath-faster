# jsonpath-faster

Query JavaScript objects with JSONPath expressions. A faster compiling / cached version of jsonpath.

## Compiled JSONPaths

This module is designed (and tested) to be highly compatible with
[jsonpath](https://www.npmjs.com/package/jsonpath) - with many extensions.

It compiles JSONpath expressions into the corresponding Javascript and caches
the resulting code. For any JSONPath that is used more than a few times the
speedup is considerable.

Here are some comparative benchmarks. The first two numbers are operations per
second. Each test involves a mix of `query`, `nodes` and `paths` with and without
limiting counts.

| JSONPath                    | jsonpath | jsonpath-faster | ratio  |
| :--                         | --:      | --:             | --:    |
| `$..*`                      | 101,974  |       2,321,381 |  19.12 |
| `$..author`                 |  88,589  |       1,397,474 |  14.70 |
| `$..[1]`                    |  71,301  |       1,567,123 |  18.91 |
| `$.store..price`            |  64,265  |       1,485,605 |  21.17 |
| `$..book[2]`                |  55,529  |       1,587,166 |  24.69 |
| `$..book[:2]`               |  48,938  |       1,508,403 |  27.24 |
| `$..book[?(@.isbn)]`        |  50,508  |       1,517,967 |  26.20 |
| `$..book[-1:]`              |  47,421  |       1,518,481 |  28.17 |
| `$..book[?(@.price==8.95)]` |  47,136  |       1,567,365 |  29.05 |
| `$..book[0,1]`              |  42,022  |       1,562,645 |  32.96 |
| `$..book[?(@.price<10)]`    |  46,786  |       1,586,545 |  29.48 |
| `$..book[(@.length-1)]`     |  29,671  |       1,612,102 |  49.18 |
| `$.*`                       | 182,293  |       9,010,209 |  49.51 |
| `$.store`                   | 183,276  |       8,728,225 |  47.76 |
| `$.store.*`                 |  95,512  |       5,338,002 |  55.93 |
| `$.store[*]`                |  89,084  |       5,578,182 |  62.54 |
| `$.store.bicycle`           |  99,969  |       8,550,540 |  85.52 |
| `$.store.book[*].author`    |  50,153  |       6,814,045 | 135.63 |
| `$.store.book.1`            |  73,105  |       8,764,344 | 119.91 |
| `$.store.book[1]`           |  63,779  |       8,686,778 | 136.63 |
| `$.store.bicycle["color"]`  |  59,106  |       8,244,142 | 139.54 |

With longer paths the speed advantage increases. You can also use 
[Nests](#nests) to combine multiple JSONpaths and corresponding
actions into a single function eliminating the redundancy of scanning
the same parts of an object multiple times.

### Memory usage

For most purposes `jsonpath-faster` will be a drop in replacement for
`jsonpath` however it does cache one or more implementation functions
for each path it sees so in cases where there are large number of distinct
paths there could be a lot of cached generated code.

### Compatibilty

In addition to its own test suite `jsonpath-faster` passes all of `jsonpath`'s
tests. 

There are two known differences (and quite a few extensions):

Script and filter expressions are sanitised differently. In general
`jsonpath-faster` is slightly more restrictive in what
it will allow (no function calls for example).

Vivification is handled differently. `jsonpath-faster` will only vivify
portions of the JSONPath that occur after any wildcards or selectors.

## Query Example

This section of the documentation is copied directly from 
[jsonpath](https://www.npmjs.com/package/jsonpath).

```javascript
var cities = [
  { name: "London", "population": 8615246 },
  { name: "Berlin", "population": 3517424 },
  { name: "Madrid", "population": 3165235 },
  { name: "Rome",   "population": 2870528 }
];

var jp = require('jsonpath-faster');
var names = jp.query(cities, '$..name');

// [ "London", "Berlin", "Madrid", "Rome" ]
```

## Install

Install from npm:
```bash
$ npm install jsonpath-faster
```

## JSONPath Syntax

Here are syntax and examples adapted from 
[Stefan Goessner's original post](http://goessner.net/articles/JsonPath/) introducing JSONPath in 2007.

JSONPath           | Description
-------------------|------------
`$`                | The root object/element
`@`                | The current object/element
`.`                | Child member operator
`..`               | Recursive descendant operator; JSONPath borrows this syntax from E4X
`*`                | Wildcard matching all objects/elements regardless their names
`[]`               | Subscript operator
`[,]`              | Union operator for alternate names or array indices as a set
`[start:end:step]` | Array slice operator borrowed from ES4 / Python
`?()`              | Applies a filter (script) expression via static evaluation
`()`	           | Script expression via static evaluation 

Given this sample data set, see example expressions below:

```javascript
{
  "store": {
    "book": [ 
      {
        "category": "reference",
        "author": "Nigel Rees",
        "title": "Sayings of the Century",
        "price": 8.95
      }, {
        "category": "fiction",
        "author": "Evelyn Waugh",
        "title": "Sword of Honour",
        "price": 12.99
      }, {
        "category": "fiction",
        "author": "Herman Melville",
        "title": "Moby Dick",
        "isbn": "0-553-21311-3",
        "price": 8.99
      }, {
         "category": "fiction",
        "author": "J. R. R. Tolkien",
        "title": "The Lord of the Rings",
        "isbn": "0-395-19395-8",
        "price": 22.99
      }
    ],
    "bicycle": {
      "color": "red",
      "price": 19.95
    }
  }
}
```

Example JSONPath expressions:

JSONPath                                          | Description
--------------------------------------------------|------------
`$.store.book[*].author`                          | The authors of all books in the store
`$..author`                                       | All authors
`$.store.*`                                       | All things in store, which are some books and a red bicycle
`$.store..price`                                  | The price of everything in the store
`$..book[2]`                                      | The third book
`$..book[(@.length-1)]`                           | The last book via script subscript
`$..book[-1:]`                                    | The last book via slice
`$..book[0,1]`                                    | The first two books via subscript union
`$..book[:2]`                                     | The first two books via subscript array slice
`$..book[?(@.isbn)]`                              | Filter all books with isbn number
`$..book[?(@.price<10)]`                          | Filter all books cheaper than 10
`$..book[?(@.price==8.95)]`                       | Filter all books that cost 8.95
`$..book[?(@.price<30 && @.category=="fiction")]` | Filter all fiction books cheaper than 30
`$..*`                                            | All members of JSON structure

## Methods

#### jp.query(obj, pathExpression[, count][, $])

Find elements in `obj` matching `pathExpression`.  Returns an array of elements
that satisfy the provided JSONPath expression, or an empty array if none were
matched.  Returns only first `count` elements if specified.

```javascript
var authors = jp.query(data, '$..author');
// [ 'Nigel Rees', 'Evelyn Waugh', 'Herman Melville', 'J. R. R. Tolkien' ]
```

A context value `$` may be provided. The contents of `$` may be accessed in
script and filter expressions.

```javascript
var bargains = jp.query(data, 
  "$..book[?(@.price <= $.price)]", { price: 10 });
// [
//   {
//     category: 'reference',
//     author: 'Nigel Rees',
//     title: 'Sayings of the Century',
//     price: 8.95
//   },
//   {
//     category: 'fiction',
//     author: 'Herman Melville',
//     title: 'Moby Dick',
//     isbn: '0-553-21311-3',
//     price: 8.99
//   }
// ]
```

#### jp.paths(obj, pathExpression[, count][, $])

Find paths to elements in `obj` matching `pathExpression`.  Returns an array of
element paths that satisfy the provided JSONPath expression. Each path is
itself an array of keys representing the location within `obj` of the matching
element.  Returns only first `count` paths if specified.

```javascript
var paths = jp.paths(data, '$..author');
// [
//   ['$', 'store', 'book', 0, 'author'] },
//   ['$', 'store', 'book', 1, 'author'] },
//   ['$', 'store', 'book', 2, 'author'] },
//   ['$', 'store', 'book', 3, 'author'] }
// ]
```

If you'd prefer to receive paths as strings check out [Pragma Chains](#pragma-chains).

#### jp.nodes(obj, pathExpression[, count][, $])

Find elements and their corresponding paths in `obj` matching `pathExpression`.
Returns an array of node objects where each node has a `path` containing an
array of keys representing the location within `obj`, and a `value` pointing to
the matched element.  Returns only first `count` nodes if specified.

```javascript
var nodes = jp.nodes(data, '$..author');
// [
//   { path: ['$', 'store', 'book', 0, 'author'], value: 'Nigel Rees' },
//   { path: ['$', 'store', 'book', 1, 'author'], value: 'Evelyn Waugh' },
//   { path: ['$', 'store', 'book', 2, 'author'], value: 'Herman Melville' },
//   { path: ['$', 'store', 'book', 3, 'author'], value: 'J. R. R. Tolkien' }
// ]
```

#### jp.value(obj, pathExpression[, newValue[, $]])

Returns the value of the first element matching `pathExpression`.  If
`newValue` is provided, sets the value of the first matching element and
returns the new value.

If you need to pass a context value without a `newValue` you must explicitly
pass `undefined` as `newValue`.

```javascript
var bargain = jp.value(data, 
  "$..book[?(@.price <= $.price)]", undefined, { price: 10 })
```

#### jp.parent(obj, pathExpression[, $])

Returns the parent of the first matching element.

#### jp.apply(obj, pathExpression, fn[, $])

Runs the supplied function `fn` on each matching element, and replaces each
matching element with any value returned from the function. The function is
passed the value of each node and its path. Returns matching nodes with 
their updated values.

```javascript
var nodes = jp.apply(data, 
  '$..author', function(value, path) { return value.toUpperCase() });
// [
//   { path: ['$', 'store', 'book', 0, 'author'], value: 'NIGEL REES' },
//   { path: ['$', 'store', 'book', 1, 'author'], value: 'EVELYN WAUGH' },
//   { path: ['$', 'store', 'book', 2, 'author'], value: 'HERMAN MELVILLE' },
//   { path: ['$', 'store', 'book', 3, 'author'], value: 'J. R. R. TOLKIEN' }
// ]
```

If `fn` returns nothing (`undefined`) the node's value will not be replaced.

```javascript
jp.apply(data, '$..author', function(value, path) { console.log(value) });
// Nigel Rees
// Evelyn Waugh
// Herman Melville
// J. R. R. Tolkien
```

#### jp.parse(pathExpression)

Parse the provided JSONPath expression into path components and their
associated operations.

```javascript
var path = jp.parse('$..author');
// [
//   { expression: { type: 'root', value: '$' } },
//   { expression: { type: 'identifier', value: 'author' }, operation: 'member', scope: 'descendant' }
// ]
```

#### jp.stringify(path)

Returns a path expression in string form, given a path.  The supplied path may
either be a flat array of keys, as returned by `jp.nodes` for example, or may
alternatively be a fully parsed path expression in the form of an array of path
components as returned by `jp.parse`.

```javascript
var pathExpression = jp.stringify(['$', 'store', 'book', 0, 'author']);
// "$.store.book[0].author"
```

## Pragma chains

The methods described above potentially walk the whole of an object returning both
interior and leaf nodes. When they return a path it is in the form of an array which
may be stringified using `jp.stringify()`.

Perhaps you'd like to get the stringified paths of all the leaf nodes in an object. The
behaviour of `jp` can be altered using pragmatic chains:

```javascript
const leaves = jp.string.leaf.paths(obj, "$..*");
// [
//   '$.store.book[0].category',
//   '$.store.book[0].author',
//   '$.store.book[0].title',
//   '$.store.book[0].price',
//   '$.store.book[1].category',
//   '$.store.book[1].author',
//   '$.store.book[1].title',
//   '$.store.book[1].price',
//   '$.store.book[2].category',
//   '$.store.book[2].author',
//   '$.store.book[2].title',
//   '$.store.book[2].isbn',
//   '$.store.book[2].price',
//   '$.store.book[3].category',
//   '$.store.book[3].author',
//   '$.store.book[3].title',
//   '$.store.book[3].isbn',
//   '$.store.book[3].price',
//   '$.store.bicycle.color',
//   '$.store.bicycle.price'
// ]
```

The available pragmas are `leaf`, `interior` and `string`.

pragma     | effect
---        | ---
`leaf`     | only visit leaf (non-object) nodes
`interior` | the opposite of `leaf`: only visit non-leaf (object) nodes
`string`   | where applicable stringify paths before returning them

The order of the pragmas is unimportant but you should try to use them in a
consistent order for maximum efficiency.

```javascript
var n1 = jp.leaf.string.paths(obj, "$..*");
var n2 = jp.string.leaf.paths(obj, "$..*");
```

The two lines above will cause the path `$..*` to be compiled twice - once in
the 'leaf.string' cache and again in the 'string.leaf' cache.

## Tagged literal syntax

You can populate a 3d matix like this but because the path is dynamic it's
not the most efficient way.

```javascript
const matrix = [];
for (let x = 0; x < 3; x++)
  for (let y = 0; y < 3; y++)
    for (let z = 0; z < 3; z++)
      jp.value(matrix, `$[${x}][${y}][${z}]`, { x, y, z });
```

Because the path is different each time, every call to `jp.value()` has to
compile and cache a new function to handle it. Only if you run the code again
later will the cached versions be used.

A more efficient approach is to use a backtick literal tagged with `jp`. 

```javascript
const matrix = [];
for (let x = 0; x < 3; x++)
  for (let y = 0; y < 3; y++)
    for (let z = 0; z < 3; z++)
      jp`$[${x}][${y}][${z}]`.value(matrix, { x, y, z });
```

In this case the path is compiled only once (with placeholders for the
bound x, y and z values). 

Internally the `$` context variable is used to pass the bound values
to the generated path function.

## Nests

Sometimes you need to run many JSONpath queries against each one of a number
of objects. Instead of compiling each individual path into its own Javascript 
function a Nest allows multiple paths to be compiled into a single function.

```javascript
const survey = [];
const authors = [];
const nest = jp.nest();
nest
  .visitor("$..*", (value, path) => survey.push({ value, path }))
  .visitor("$..author", value => authors.push(value))
  .mutator("$..price", value => value * 1.1);

nest(data); // the nest is a function
// All prices increased by 10%, survey and authors arrays populated
```

Calling the nest function runs all the actions that you have registered with
the nest. Actions with paths that share a common prefix are efficiently
compiled so that the prefix is traversed only once. In the following 
example the code to traverse `$.assets[*]..meta` is executed only once
for each call `nest()`

```javascript
nest
  .visitor("$.assets[*]..meta.id", value => {})
  .visitor("$.assets[*]..meta.author", value => {})
  .visitor("$.assets[*]..meta.modified", value => {});
```

This can be written more concisely using `prefix`.

```javascript
nest
  .prefix("$.assets[*]..meta")
  .visitor("$.id", value => {})
  .visitor("$.author", value => {})
  .visitor("$.modified", value => {});
```

#### Execution order

A nest attempts to behave as if the visitors are executed in the order they were
declared even though, as in the example above, the paths may be matched in a
different order. To do this it defers all the actions until after the search
of the object is complete.

That means that any mutations are executed after the object has been scanned
so the following code may have surprising results.

```javascript
nest
  .mutator("$..thing.seen", true)
  .visitor("$..seen", (value, path) => console.log(`Seen at ${path}`));
```

The visitor won't match any of the `seen` flags set by the mutator because the
mutations only take place after the object has been scanned. If you need to
work with the mutated values use a second nest.

#### Pragmas

Like `jp` nests understand pragma chains.

```javascript
const nest = jp.nest();
nest.string.leaf.visitor("$..*", (value, path) =>
  console.log(`${path}: ${value}`)
);
```

A nest inherits pragmas from the `jp` that creates it, so this is equivalent to
the previous example:

```javascript
const nest = jp.string.leaf.nest();
nest.visitor("$..*", (value, path) => {
  console.log(`${path}: ${value}`)
});
```

## Nest methods

#### jp.nest()

Creates a new, empty nest. Actions may be added using its `visitor`, `mutator`,
`setter` and `at` methods. Having added actions the nest may be called as
a function to apply the actions to an object.

```javascript
const nest = jp.nest();
nest.visitor("$..*", (value, path) => console.log(path));
for (const doc of docs) {
  nest(doc);
}
```

The nest function accepts an optional second argument that, if present will
be bound to `$` and may be referred to in script and filter expressions and
in any code compiled using `nest.at()`.

Its return value is the resulting object after all mutators and setters have
been applied to it. Usually this is the same as the `doc`
you passed in. However it is possible to vivify an undefined root object.

```javascript
const mp = jp.nest().setter("$", { empty: false });
const obj = mp(undefined);
// obj is { empty: false }
```

#### nest.visitor(path, fn)

Register a visitor function that will be called for each matching node in the
object. The function is called with two arguments: value and path.

```javascript
nest.string.visitor("$..books[*].authors[(@.length - 1)].name",
  (value, path) => console.log(`${path}: ${value}`));
```

If you don't need the path provide a function that accepts only a
single value argument; the generated code is slightly faster if it doesn't
have to track the path as it traverses the object.

```javascript
nest.visitor("$..books[*].authors[(@.length - 1)].name", 
  value => console.log(value));
```

#### nest.mutator(path, fn)

Similar to `visitor` but the matched value is set to the return value of the
callback function. A mutator does not vivify missing parts of the object.

```javascript
nest.mutator("$..price", price => price * 3);
```

If the replacement value is a constant it may be passed directly.

```javascript
nest.mutator("$..price", price => 1); // everything's a £
```

#### nest.setter(path, fn)

Like `mutator` but with vivification enabled. Like `mutator` it accepts either
a function or a constant.

```javascript
nest.setter("$.this.does.not.exist.yet", true);
```

#### nest.at(path, code)

Inject code directly into the generated nest function. Within the supplied code `@`
is a magic variable which provides access to various contextual values.

```javascript
nest.at("$..vehicle", "console.log(@.value, @.path)")
```

The `@` pseudo-variable has these properties

Property       | Description
---------------|-------------
`@.value`      | The value of the current node
`@.nvalue`     | Non-vivifying version of `@.value` (see below)
`@.parent`     | The parent of the current node
`@.pathArray`  | The path to the current node as an array `["$", "books", 0, "author"]`
`@.pathString` | The path to the current node as a string
`@.path`       | The path as either an array or a string depending on the ambient `string` pragma

When `@.value` is used on the left hand side of an assignment it tells the code generator to
vivify as far as possible the path leading up to this node. If vivifaction is not desired
the code may assign to `@.nvalue` instead.

```javascript
nest.at("$..flags.seen", "@.value = true");  // create `seen`
nest.at("$..flags.seen", "@.nvalue = true"); // only sets existing `seen`
```

#### nest.prefix(path)

Add a prefix path for this call chain.

```javascript
nest
  .prefix("$.assets[*]..meta")
  .visitor("$.id", value => {})
  .visitor("$.author", value => {})
  .visitor("$.modified", value => {});
```

## License

[MIT](LICENSE)

