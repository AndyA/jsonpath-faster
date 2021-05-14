/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/tokens.js TAP > child member 1`] = `
{
  "included": [
    {
      "expression": {
        "type": "wildcard",
        "value": "*"
      },
      "scope": "child",
      "operation": "member"
    },
    {
      "expression": {
        "type": "identifier",
        "value": "store"
      },
      "scope": "child",
      "operation": "member"
    },
    {
      "expression": {
        "type": "identifier",
        "value": "bicycle"
      },
      "scope": "child",
      "operation": "member"
    }
  ],
  "excluded": [
    {
      "expression": {
        "type": "root",
        "value": "$"
      }
    },
    {
      "expression": {
        "type": "wildcard",
        "value": "*"
      },
      "scope": "descendant",
      "operation": "member"
    }
  ]
}
`

exports[`test/tokens.js TAP > function 1`] = `
{
  "included": [
    {
      "expression": {
        "type": "wildcard",
        "value": "*"
      },
      "scope": "child",
      "operation": "member"
    },
    {
      "expression": {
        "type": "wildcard",
        "value": "*"
      },
      "scope": "descendant",
      "operation": "member"
    }
  ],
  "excluded": [
    {
      "expression": {
        "type": "root",
        "value": "$"
      }
    },
    {
      "expression": {
        "type": "identifier",
        "value": "store"
      },
      "scope": "child",
      "operation": "member"
    },
    {
      "expression": {
        "type": "identifier",
        "value": "bicycle"
      },
      "scope": "child",
      "operation": "member"
    }
  ]
}
`

exports[`test/tokens.js TAP > functional property 1`] = `
{
  "included": [
    {
      "expression": {
        "type": "wildcard",
        "value": "*"
      },
      "scope": "child",
      "operation": "member"
    },
    {
      "expression": {
        "type": "wildcard",
        "value": "*"
      },
      "scope": "descendant",
      "operation": "member"
    }
  ],
  "excluded": [
    {
      "expression": {
        "type": "root",
        "value": "$"
      }
    },
    {
      "expression": {
        "type": "identifier",
        "value": "store"
      },
      "scope": "child",
      "operation": "member"
    },
    {
      "expression": {
        "type": "identifier",
        "value": "bicycle"
      },
      "scope": "child",
      "operation": "member"
    }
  ]
}
`

exports[`test/tokens.js TAP > match all 1`] = `
{
  "included": [
    {
      "expression": {
        "type": "root",
        "value": "$"
      }
    },
    {
      "expression": {
        "type": "wildcard",
        "value": "*"
      },
      "scope": "child",
      "operation": "member"
    },
    {
      "expression": {
        "type": "wildcard",
        "value": "*"
      },
      "scope": "descendant",
      "operation": "member"
    },
    {
      "expression": {
        "type": "identifier",
        "value": "store"
      },
      "scope": "child",
      "operation": "member"
    },
    {
      "expression": {
        "type": "identifier",
        "value": "bicycle"
      },
      "scope": "child",
      "operation": "member"
    }
  ],
  "excluded": []
}
`

exports[`test/tokens.js TAP > root 1`] = `
{
  "included": [
    {
      "expression": {
        "type": "root",
        "value": "$"
      }
    }
  ],
  "excluded": [
    {
      "expression": {
        "type": "wildcard",
        "value": "*"
      },
      "scope": "child",
      "operation": "member"
    },
    {
      "expression": {
        "type": "wildcard",
        "value": "*"
      },
      "scope": "descendant",
      "operation": "member"
    },
    {
      "expression": {
        "type": "identifier",
        "value": "store"
      },
      "scope": "child",
      "operation": "member"
    },
    {
      "expression": {
        "type": "identifier",
        "value": "bicycle"
      },
      "scope": "child",
      "operation": "member"
    }
  ]
}
`

exports[`test/tokens.js TAP > root or descendant 1`] = `
{
  "included": [
    {
      "expression": {
        "type": "root",
        "value": "$"
      }
    },
    {
      "expression": {
        "type": "wildcard",
        "value": "*"
      },
      "scope": "descendant",
      "operation": "member"
    }
  ],
  "excluded": [
    {
      "expression": {
        "type": "wildcard",
        "value": "*"
      },
      "scope": "child",
      "operation": "member"
    },
    {
      "expression": {
        "type": "identifier",
        "value": "store"
      },
      "scope": "child",
      "operation": "member"
    },
    {
      "expression": {
        "type": "identifier",
        "value": "bicycle"
      },
      "scope": "child",
      "operation": "member"
    }
  ]
}
`
