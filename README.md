# jsonpath-faster

Query JavaScript objects with JSONPath expressions. A faster compiling / cached version of jsonpath.

## Compiled JSONPaths

This module is designed (and tested) to be 100% compatible with
[jsonpath](https://www.npmjs.com/package/jsonpath).

It compiles JSONpath expressions into the corresponding Javascript and caches
the resulting code. For any JSONPath that is used more than a few times the
speedup is considerable.

Here are some comparative benchmarks. The first two numbers are operations per
second. Each test involves a mix of `query`, `nodes` and `paths` with and without
limiting counts.

| JSONPath                    | jsonpath | jsonpath-faster | ratio  |
| :--                         | --:      | --:             | --:    |
| `$..*`                      | 101,974  |       2,321,381 |  19.12 |
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

With longer paths the advantage increases.

### Memory usage

For most purposes `jsonpath-faster` will be a drop in replacement for
`jsonpath` however it does cache one or more implementation functions
for each path it sees so in cases where there are large number of distinct
paths there could be a lot of cached generated code.

### Compatibilty

In addition to its own test suite `jsonpath-faster` passes all of `jsonpath`'s
tests. Script and filter expressions are sanitised differently. In general
`jsonpath-faster` is slightly more restrictive in what it will allow (no
function calls for example).

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

JSONPath                      | Description
------------------------------|------------
`$.store.book[*].author`       | The authors of all books in the store
`$..author`                     | All authors
`$.store.*`                    | All things in store, which are some books and a red bicycle
`$.store..price`                | The price of everything in the store
`$..book[2]`                    | The third book
`$..book[(@.length-1)]`         | The last book via script subscript
`$..book[-1:]`                  | The last book via slice
`$..book[0,1]`                  | The first two books via subscript union
`$..book[:2]`                  | The first two books via subscript array slice
`$..book[?(@.isbn)]`            | Filter all books with isbn number
`$..book[?(@.price<10)]`        | Filter all books cheaper than 10
`$..book[?(@.price==8.95)]`        | Filter all books that cost 8.95
`$..book[?(@.price<30 && @.category=="fiction")]`        | Filter all fiction books cheaper than 30
`$..*`                         | All members of JSON structure


## Methods

#### jp.query(obj, pathExpression[, count])

Find elements in `obj` matching `pathExpression`.  Returns an array of elements
that satisfy the provided JSONPath expression, or an empty array if none were
matched.  Returns only first `count` elements if specified.

```javascript
var authors = jp.query(data, '$..author');
// [ 'Nigel Rees', 'Evelyn Waugh', 'Herman Melville', 'J. R. R. Tolkien' ]
```

#### jp.paths(obj, pathExpression[, count])

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

#### jp.nodes(obj, pathExpression[, count])

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

#### jp.value(obj, pathExpression[, newValue])

Returns the value of the first element matching `pathExpression`.  If
`newValue` is provided, sets the value of the first matching element and
returns the new value.

#### jp.parent(obj, pathExpression)

Returns the parent of the first matching element.

#### jp.apply(obj, pathExpression, fn)

Runs the supplied function `fn` on each matching element, and replaces each
matching element with the return value from the function.  The function accepts
the value of the matching element as its only parameter.  Returns matching
nodes with their updated values.


```javascript
var nodes = jp.apply(data, '$..author', function(value) { return value.toUpperCase() });
// [
//   { path: ['$', 'store', 'book', 0, 'author'], value: 'NIGEL REES' },
//   { path: ['$', 'store', 'book', 1, 'author'], value: 'EVELYN WAUGH' },
//   { path: ['$', 'store', 'book', 2, 'author'], value: 'HERMAN MELVILLE' },
//   { path: ['$', 'store', 'book', 3, 'author'], value: 'J. R. R. TOLKIEN' }
// ]
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

## Differences from jsonpath


#### Evaluating Script Expressions

Script expressions are a potential security hole - particularly if you evaluate
JSONpaths from an untrusted source. `jsonpath` uses [static-eval](https://github.com/substack/static-eval) 
to evaluate expressions in a relatively safe way.

`jsonpath-faster` transforms script expressions using `esprima`, `estraverse` &
`escodegen` only allowing constructs that are considered safe. The only variable
that can be accessed is `@`. Statements, function calls, throw, comments and many
other dangerous constructs are all blocked.

This code has not been security audited. Please don't feed untrusted code into
until it has been.

#### Grammar

This project uses a formal BNF
[grammar](https://github.com/dchester/jsonpath/blob/master/lib/grammar.js) to
parse JSONPath expressions, an attempt at reverse-engineering the intent of the
original implementation, which parses via a series of creative regular
expressions.  The original regex approach can sometimes be forgiving for better
or for worse (e.g., `$['store]` => `$['store']`), and in other cases, can be
just plain wrong (e.g. `[` => `$`). 

#### Other Minor Differences

As a result of using a real parser and static evaluation, there are some
arguable bugs in the original library that have not been carried through here:

- strings in subscripts may now be double-quoted
- final `step` arguments in slice operators may now be negative
- script expressions may now contain `.` and `@` characters not referring to instance variables
- subscripts no longer act as character slices on string elements
- non-ascii non-word characters are no-longer valid in member identifier names; use quoted subscript strings instead (e.g., `$['$']` instead of `$.$`)
- unions now yield real unions with no duplicates rather than concatenated results

## License

[MIT](LICENSE)

