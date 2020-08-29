/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/vivifiers.js TAP > $..id 1`] = `
[
  {
    "expression": {
      "type": "root",
      "value": "$"
    },
    "pragmas": {}
  },
  {
    "expression": {
      "type": "identifier",
      "value": "id"
    },
    "scope": "descendant",
    "operation": "member",
    "pragmas": {}
  }
]
`

exports[`test/vivifiers.js TAP > $.foo.bar, $.foo.baz 1`] = `
[
  {
    "expression": {
      "type": "root",
      "value": "$"
    },
    "pragmas": {},
    "vivify": true,
    "vv": "{}"
  },
  {
    "expression": {
      "type": "identifier",
      "value": "foo"
    },
    "scope": "child",
    "operation": "member",
    "pragmas": {},
    "vivify": true,
    "vv": "{}"
  },
  {
    "scope": "internal",
    "operation": "fork",
    "vivify": true,
    "next": [
      [
        {
          "expression": {
            "type": "identifier",
            "value": "bar"
          },
          "scope": "child",
          "operation": "member",
          "pragmas": {},
          "vivify": true
        }
      ],
      [
        {
          "expression": {
            "type": "identifier",
            "value": "baz"
          },
          "scope": "child",
          "operation": "member",
          "pragmas": {},
          "vivify": true
        }
      ]
    ],
    "pragmas": {}
  }
]
`

exports[`test/vivifiers.js TAP > $.foo.bar, $.foo.baz[0].id, $.foo.baz[2].id 1`] = `
[
  {
    "expression": {
      "type": "root",
      "value": "$"
    },
    "pragmas": {},
    "vivify": true,
    "vv": "{}"
  },
  {
    "expression": {
      "type": "identifier",
      "value": "foo"
    },
    "scope": "child",
    "operation": "member",
    "pragmas": {},
    "vivify": true,
    "vv": "{}"
  },
  {
    "scope": "internal",
    "operation": "fork",
    "vivify": true,
    "next": [
      [
        {
          "expression": {
            "type": "identifier",
            "value": "bar"
          },
          "scope": "child",
          "operation": "member",
          "pragmas": {},
          "vivify": true
        }
      ],
      [
        {
          "expression": {
            "type": "identifier",
            "value": "baz"
          },
          "scope": "child",
          "operation": "member",
          "pragmas": {},
          "vivify": true,
          "vv": "[]"
        },
        {
          "scope": "internal",
          "operation": "fork",
          "vivify": true,
          "next": [
            [
              {
                "expression": {
                  "type": "numeric_literal",
                  "value": 0
                },
                "scope": "child",
                "operation": "subscript",
                "pragmas": {},
                "vivify": true,
                "vv": "{}"
              },
              {
                "expression": {
                  "type": "identifier",
                  "value": "id"
                },
                "scope": "child",
                "operation": "member",
                "pragmas": {},
                "vivify": true
              }
            ],
            [
              {
                "expression": {
                  "type": "numeric_literal",
                  "value": 2
                },
                "scope": "child",
                "operation": "subscript",
                "pragmas": {},
                "vivify": true,
                "vv": "{}"
              },
              {
                "expression": {
                  "type": "identifier",
                  "value": "id"
                },
                "scope": "child",
                "operation": "member",
                "pragmas": {},
                "vivify": true
              }
            ]
          ],
          "pragmas": {}
        }
      ]
    ],
    "pragmas": {}
  }
]
`

exports[`test/vivifiers.js TAP > $.foo[($.idx)] 1`] = `
[
  {
    "expression": {
      "type": "root",
      "value": "$"
    },
    "pragmas": {},
    "vivify": true,
    "vv": "{}"
  },
  {
    "expression": {
      "type": "identifier",
      "value": "foo"
    },
    "scope": "child",
    "operation": "member",
    "pragmas": {},
    "vivify": true
  },
  {
    "expression": {
      "type": "script_expression",
      "value": "($.idx)"
    },
    "scope": "child",
    "operation": "subscript",
    "pragmas": {},
    "vivify": true
  }
]
`

exports[`test/vivifiers.js TAP > $.foo[3].bar[1] 1`] = `
[
  {
    "expression": {
      "type": "root",
      "value": "$"
    },
    "pragmas": {},
    "vivify": true,
    "vv": "{}"
  },
  {
    "expression": {
      "type": "identifier",
      "value": "foo"
    },
    "scope": "child",
    "operation": "member",
    "pragmas": {},
    "vivify": true,
    "vv": "[]"
  },
  {
    "expression": {
      "type": "numeric_literal",
      "value": 3
    },
    "scope": "child",
    "operation": "subscript",
    "pragmas": {},
    "vivify": true,
    "vv": "{}"
  },
  {
    "expression": {
      "type": "identifier",
      "value": "bar"
    },
    "scope": "child",
    "operation": "member",
    "pragmas": {},
    "vivify": true,
    "vv": "[]"
  },
  {
    "expression": {
      "type": "numeric_literal",
      "value": 1
    },
    "scope": "child",
    "operation": "subscript",
    "pragmas": {},
    "vivify": true
  }
]
`

exports[`test/vivifiers.js TAP > $.person[(1-1)][("id")].name 1`] = `
[
  {
    "expression": {
      "type": "root",
      "value": "$"
    },
    "pragmas": {},
    "vivify": true,
    "vv": "{}"
  },
  {
    "expression": {
      "type": "identifier",
      "value": "person"
    },
    "scope": "child",
    "operation": "member",
    "pragmas": {},
    "vivify": true
  },
  {
    "expression": {
      "type": "script_expression",
      "value": "(1-1)"
    },
    "scope": "child",
    "operation": "subscript",
    "pragmas": {},
    "vivify": true
  },
  {
    "expression": {
      "type": "script_expression",
      "value": "(\\"id\\")"
    },
    "scope": "child",
    "operation": "subscript",
    "pragmas": {},
    "vivify": true,
    "vv": "{}"
  },
  {
    "expression": {
      "type": "identifier",
      "value": "name"
    },
    "scope": "child",
    "operation": "member",
    "pragmas": {},
    "vivify": true
  }
]
`
