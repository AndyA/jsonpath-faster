"use strict";

const walk = (obj, internal) => {
  const nodes = [];
  const isSym = /^[a-z_]\w*$/i;
  const path = ["$"];
  const wp = obj => {
    if ("object" === typeof obj) {
      if (internal) nodes.push({ path: path.join(""), value: obj });
      const lp = path.length;
      path.push(""); // placeholder
      if (Array.isArray(obj)) {
        const la = obj.length;
        for (let i = 0; i < la; i++) {
          path[lp] = "[" + i + "]";
          wp(obj[i]);
        }
      } else {
        for (const [k, v] of Object.entries(obj)) {
          path[lp] = isSym.test(k) ? "." + k : "[" + JSON.stringify(k) + "]";
          wp(v);
        }
      }
      path.pop();
    } else {
      nodes.push({ path: path.join(""), value: obj });
    }
  };
  wp(obj);
  return nodes;
};

module.exports = {
  walkPaths: obj => walk(obj, true),
  walkLeaves: obj => walk(obj, false)
};
