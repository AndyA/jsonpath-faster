"use strict";

const addPragmas = (obj, pragmas, post) => {
  const nobj = { ...obj, pragmas: {} };

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

  return Object.defineProperties(nobj, props);
};

module.exports = addPragmas;
