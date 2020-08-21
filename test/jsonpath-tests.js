"use strict";

const tap = require("tap");

tap.spawn("npm", ["run", "--silent", "upstream-test"], {}, `jsonpath tests`);

