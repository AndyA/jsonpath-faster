"use strict";

const addPragmas = (obj, pragmas, post) => {
  const props = {};
  for (const pragma of pragmas) {
    props[pragma] = {
      configurable: true,
      get: function() {
        if (this.pragmas[pragma])
          return Object.defineProperty(this, pragma, { value: this });

        let value = addPragmas({ ...this }, pragmas, post);
        value.pragmas = { ...this.pragmas, [pragma]: true };
        if (post) value = post(value);
        Object.defineProperty(this, pragma, { value });
        return value;
      }
    };
  }

  obj.pragmas = obj.pragmas || {};

  return Object.defineProperties(obj, props);
};

module.exports = addPragmas;
