module.exports = [
  {
    path: "$.store",
    ast: [
      { expression: { type: "root", value: "$" } },
      {
        expression: { type: "identifier", value: "store" },
        scope: "child",
        operation: "member"
      }
    ]
  },
  {
    path: "$.store.bicycle",
    ast: [
      { expression: { type: "root", value: "$" } },
      {
        expression: { type: "identifier", value: "store" },
        scope: "child",
        operation: "member"
      },
      {
        expression: { type: "identifier", value: "bicycle" },
        scope: "child",
        operation: "member"
      }
    ]
  },
  {
    path: "$.store.*",
    ast: [
      { expression: { type: "root", value: "$" } },
      {
        expression: { type: "identifier", value: "store" },
        scope: "child",
        operation: "member"
      },
      {
        expression: { type: "wildcard", value: "*" },
        scope: "child",
        operation: "member"
      }
    ]
  },
  {
    path: "$.store[*]",
    ast: [
      { expression: { type: "root", value: "$" } },
      {
        expression: { type: "identifier", value: "store" },
        scope: "child",
        operation: "member"
      },
      {
        expression: { type: "wildcard", value: "*" },
        scope: "child",
        operation: "subscript"
      }
    ]
  },
  {
    path: "$.store.book[1]",
    ast: [
      { expression: { type: "root", value: "$" } },
      {
        expression: { type: "identifier", value: "store" },
        scope: "child",
        operation: "member"
      },
      {
        expression: { type: "identifier", value: "book" },
        scope: "child",
        operation: "member"
      },
      {
        expression: { type: "numeric_literal", value: 1 },
        scope: "child",
        operation: "subscript"
      }
    ]
  },
  {
    path: "$.store.book.1",
    ast: [
      { expression: { type: "root", value: "$" } },
      {
        expression: { type: "identifier", value: "store" },
        scope: "child",
        operation: "member"
      },
      {
        expression: { type: "identifier", value: "book" },
        scope: "child",
        operation: "member"
      },
      {
        expression: { type: "numeric_literal", value: 1 },
        scope: "child",
        operation: "member"
      }
    ]
  },
  {
    path: '$.store.bicycle["color"]',
    ast: [
      { expression: { type: "root", value: "$" } },
      {
        expression: { type: "identifier", value: "store" },
        scope: "child",
        operation: "member"
      },
      {
        expression: { type: "identifier", value: "bicycle" },
        scope: "child",
        operation: "member"
      },
      {
        expression: { type: "string_literal", value: "color" },
        scope: "child",
        operation: "subscript"
      }
    ]
  },
  {
    path: "$.store.book[*].author",
    ast: [
      { expression: { type: "root", value: "$" } },
      {
        expression: { type: "identifier", value: "store" },
        scope: "child",
        operation: "member"
      },
      {
        expression: { type: "identifier", value: "book" },
        scope: "child",
        operation: "member"
      },
      {
        expression: { type: "wildcard", value: "*" },
        scope: "child",
        operation: "subscript"
      },
      {
        expression: { type: "identifier", value: "author" },
        scope: "child",
        operation: "member"
      }
    ]
  },
  {
    path: "$..author",
    ast: [
      { expression: { type: "root", value: "$" } },
      {
        expression: { type: "identifier", value: "author" },
        scope: "descendant",
        operation: "member"
      }
    ]
  },
  {
    path: "$..[1]",
    ast: [
      { expression: { type: "root", value: "$" } },
      {
        expression: { type: "numeric_literal", value: 1 },
        scope: "descendant",
        operation: "subscript"
      }
    ]
  },
  {
    path: "$..[(@.length-1)]",
    ast: [
      { expression: { type: "root", value: "$" } },
      {
        expression: { type: "script_expression", value: "(@.length-1)" },
        scope: "descendant",
        operation: "subscript"
      }
    ]
  },
  {
    path: "$.store..price",
    ast: [
      { expression: { type: "root", value: "$" } },
      {
        expression: { type: "identifier", value: "store" },
        scope: "child",
        operation: "member"
      },
      {
        expression: { type: "identifier", value: "price" },
        scope: "descendant",
        operation: "member"
      }
    ]
  },
  {
    path: "$..book[2]",
    ast: [
      { expression: { type: "root", value: "$" } },
      {
        expression: { type: "identifier", value: "book" },
        scope: "descendant",
        operation: "member"
      },
      {
        expression: { type: "numeric_literal", value: 2 },
        scope: "child",
        operation: "subscript"
      }
    ]
  },
  {
    path: "$..*",
    ast: [
      { expression: { type: "root", value: "$" } },
      {
        expression: { type: "wildcard", value: "*" },
        scope: "descendant",
        operation: "member"
      }
    ]
  },
  {
    path: "$..book[(@.length-1)]",
    ast: [
      { expression: { type: "root", value: "$" } },
      {
        expression: { type: "identifier", value: "book" },
        scope: "descendant",
        operation: "member"
      },
      {
        expression: { type: "script_expression", value: "(@.length-1)" },
        scope: "child",
        operation: "subscript"
      }
    ]
  },
  {
    path: "$..book[-1:]",
    ast: [
      { expression: { type: "root", value: "$" } },
      {
        expression: { type: "identifier", value: "book" },
        scope: "descendant",
        operation: "member"
      },
      {
        expression: { type: "slice", value: "-1:" },
        scope: "child",
        operation: "subscript"
      }
    ]
  },
  {
    path: "$..book[0,1]",
    ast: [
      { expression: { type: "root", value: "$" } },
      {
        expression: { type: "identifier", value: "book" },
        scope: "descendant",
        operation: "member"
      },
      {
        expression: {
          type: "union",
          value: [
            { expression: { type: "numeric_literal", value: 0 } },
            { expression: { type: "numeric_literal", value: 1 } }
          ]
        },
        scope: "child",
        operation: "subscript"
      }
    ]
  },
  {
    path: "$..book[:2]",
    ast: [
      { expression: { type: "root", value: "$" } },
      {
        expression: { type: "identifier", value: "book" },
        scope: "descendant",
        operation: "member"
      },
      {
        expression: { type: "slice", value: ":2" },
        scope: "child",
        operation: "subscript"
      }
    ]
  },
  {
    path: "$..book[?(@.isbn)]",
    ast: [
      { expression: { type: "root", value: "$" } },
      {
        expression: { type: "identifier", value: "book" },
        scope: "descendant",
        operation: "member"
      },
      {
        expression: { type: "filter_expression", value: "?(@.isbn)" },
        scope: "child",
        operation: "subscript"
      }
    ]
  },
  {
    path: "$..book[?(@.price<10)]",
    ast: [
      { expression: { type: "root", value: "$" } },
      {
        expression: { type: "identifier", value: "book" },
        scope: "descendant",
        operation: "member"
      },
      {
        expression: { type: "filter_expression", value: "?(@.price<10)" },
        scope: "child",
        operation: "subscript"
      }
    ]
  },
  {
    path: "$..book[?(@.price==8.95)]",
    ast: [
      { expression: { type: "root", value: "$" } },
      {
        expression: { type: "identifier", value: "book" },
        scope: "descendant",
        operation: "member"
      },
      {
        expression: { type: "filter_expression", value: "?(@.price==8.95)" },
        scope: "child",
        operation: "subscript"
      }
    ]
  },
  {
    path: '$..book[?(@.price<30 && @.category=="fiction")]',
    ast: [
      { expression: { type: "root", value: "$" } },
      {
        expression: { type: "identifier", value: "book" },
        scope: "descendant",
        operation: "member"
      },
      {
        expression: {
          type: "filter_expression",
          value: '?(@.price<30 && @.category=="fiction")'
        },
        scope: "child",
        operation: "subscript"
      }
    ]
  }
];
