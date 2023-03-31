"use strict";

function makeKey(obj) {
  obj.pragmaKey = Object.keys(obj.pragmas).sort().join(":");
}

const addPragmas = (obj, pragmas, post) => {
  const props = {};
  for (const pragma of pragmas) {
    props[pragma] = {
      configurable: true,
      get: function () {
        // If this object already has this pragma redefine the pragma
        // accessor to return this.
        if (this.pragmas[pragma])
          return Object.defineProperty(this, pragma, { value: this });

        let value = { ...this };
        if (post) value = post(value);
        addPragmas(value, pragmas, post);
        value.pragmas = { ...this.pragmas, [pragma]: true };
        makeKey(value);
        // Redefine pragma accessor to return the new instance
        Object.defineProperty(this, pragma, { value });
        return value;
      },
    };
  }

  obj.pragmas = obj.pragmas || {};
  makeKey(obj);

  return Object.defineProperties(obj, props);
};

module.exports = addPragmas;
