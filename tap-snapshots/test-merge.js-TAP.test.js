/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/merge.js TAP > makeTree makes trees 1`] = `
[
  {
    "tok": {
      "expression": {
        "type": "root",
        "value": "$"
      }
    },
    "next": [
      {
        "tok": {
          "expression": {
            "type": "wildcard",
            "value": "*"
          },
          "scope": "descendant",
          "operation": "member"
        }
      }
    ]
  }
]
`

exports[`test/merge.js TAP > makeTree parses forks 1`] = `
[
  {
    "tok": {
      "expression": {
        "type": "root",
        "value": "$"
      }
    },
    "next": [
      {
        "tok": {
          "expression": {
            "type": "identifier",
            "value": "foo"
          },
          "scope": "child",
          "operation": "member"
        },
        "next": [
          {
            "tok": {
              "expression": {
                "type": "identifier",
                "value": "foo"
              },
              "scope": "child",
              "operation": "member"
            }
          },
          {
            "tok": {
              "expression": {
                "type": "identifier",
                "value": "bar"
              },
              "scope": "child",
              "operation": "member"
            }
          }
        ]
      }
    ]
  }
]
`

exports[`test/merge.js TAP > mergeTrees merges forked ASTs #1 1`] = `
{
  "t5": [
    {
      "tok": {
        "expression": {
          "type": "root",
          "value": "$"
        }
      },
      "next": [
        {
          "tok": {
            "expression": {
              "type": "identifier",
              "value": "foo"
            },
            "scope": "child",
            "operation": "member"
          },
          "next": [
            {
              "tok": {
                "expression": {
                  "type": "identifier",
                  "value": "foo"
                },
                "scope": "child",
                "operation": "member"
              }
            },
            {
              "tok": {
                "expression": {
                  "type": "identifier",
                  "value": "bar"
                },
                "scope": "child",
                "operation": "member"
              }
            }
          ]
        }
      ]
    }
  ],
  "t6": [
    {
      "tok": {
        "expression": {
          "type": "root",
          "value": "$"
        }
      },
      "next": [
        {
          "tok": {
            "expression": {
              "type": "identifier",
              "value": "bar"
            },
            "scope": "child",
            "operation": "member"
          },
          "next": [
            {
              "tok": {
                "expression": {
                  "type": "identifier",
                  "value": "foo"
                },
                "scope": "child",
                "operation": "member"
              }
            },
            {
              "tok": {
                "expression": {
                  "type": "identifier",
                  "value": "bar"
                },
                "scope": "child",
                "operation": "member"
              }
            }
          ]
        }
      ]
    }
  ]
}
`

exports[`test/merge.js TAP > mergeTrees merges forked ASTs #2 1`] = `
{
  "m1": [
    {
      "expression": {
        "type": "root",
        "value": "$"
      }
    },
    {
      "scope": "internal",
      "operation": "fork",
      "next": [
        [
          {
            "expression": {
              "type": "identifier",
              "value": "foo"
            },
            "scope": "child",
            "operation": "member"
          },
          {
            "scope": "internal",
            "operation": "fork",
            "next": [
              [
                {
                  "expression": {
                    "type": "identifier",
                    "value": "foo"
                  },
                  "scope": "child",
                  "operation": "member"
                }
              ],
              [
                {
                  "expression": {
                    "type": "identifier",
                    "value": "bar"
                  },
                  "scope": "child",
                  "operation": "member"
                }
              ]
            ]
          }
        ],
        [
          {
            "expression": {
              "type": "identifier",
              "value": "bar"
            },
            "scope": "child",
            "operation": "member"
          },
          {
            "scope": "internal",
            "operation": "fork",
            "next": [
              [
                {
                  "expression": {
                    "type": "identifier",
                    "value": "foo"
                  },
                  "scope": "child",
                  "operation": "member"
                }
              ],
              [
                {
                  "expression": {
                    "type": "identifier",
                    "value": "bar"
                  },
                  "scope": "child",
                  "operation": "member"
                }
              ]
            ]
          }
        ]
      ]
    }
  ]
}
`

exports[`test/merge.js TAP > mergeTrees merges simple ASTs 1`] = `
{
  "a1": [
    {
      "expression": {
        "type": "root",
        "value": "$"
      }
    },
    {
      "expression": {
        "type": "identifier",
        "value": "foo"
      },
      "scope": "child",
      "operation": "member"
    },
    {
      "scope": "internal",
      "operation": "fork",
      "next": [
        [
          {
            "expression": {
              "type": "identifier",
              "value": "foo"
            },
            "scope": "child",
            "operation": "member"
          }
        ],
        [
          {
            "expression": {
              "type": "identifier",
              "value": "bar"
            },
            "scope": "child",
            "operation": "member"
          }
        ]
      ]
    }
  ],
  "a2": [
    {
      "expression": {
        "type": "root",
        "value": "$"
      }
    },
    {
      "expression": {
        "type": "identifier",
        "value": "bar"
      },
      "scope": "child",
      "operation": "member"
    },
    {
      "scope": "internal",
      "operation": "fork",
      "next": [
        [
          {
            "expression": {
              "type": "identifier",
              "value": "foo"
            },
            "scope": "child",
            "operation": "member"
          }
        ],
        [
          {
            "expression": {
              "type": "identifier",
              "value": "bar"
            },
            "scope": "child",
            "operation": "member"
          }
        ]
      ]
    }
  ]
}
`

exports[`test/merge.js TAP > renderTree renders forks 1`] = `
[
  {
    "expression": {
      "type": "root",
      "value": "$"
    }
  },
  {
    "expression": {
      "type": "identifier",
      "value": "foo"
    },
    "scope": "child",
    "operation": "member"
  },
  {
    "scope": "internal",
    "operation": "fork",
    "next": [
      [
        {
          "expression": {
            "type": "identifier",
            "value": "foo"
          },
          "scope": "child",
          "operation": "member"
        }
      ],
      [
        {
          "expression": {
            "type": "identifier",
            "value": "bar"
          },
          "scope": "child",
          "operation": "member"
        }
      ]
    ]
  }
]
`
