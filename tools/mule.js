"use strict";

const { bindLastly } = require("../lib/lastly");

const out = bindLastly("cb(@.value, @.path, @.pathString)", {
  value: () => "obj.foo",
  path: () => "stack.slice(0)",
  pathString: () => "jp.stringify(@.path)"
});
console.log(out);
