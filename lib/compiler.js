"use strict";

const jp = require("jsonpath");

class Compiler {
  constructor(compiler, lib, opt) {
    this.compiler = this.constructor.makeLadder(compiler);
    this.lib = lib;
    this.opt = Object.assign({}, opt || {});
  }

  static makeTokenMatcher(test) {
    if (typeof test === "function") return test;

    const match = (obj, test) => {
      if (Array.isArray(test)) return test.some(test => match(obj, test));
      if (typeof test === "function") return test(obj);
      if (typeof obj === "string") return test === obj;
      for (const prop in test) if (!match(obj[prop], test[prop])) return false;
      return true;
    };

    return tok => match(tok, test);
  }

  static makeLadder(rungs) {
    return rungs.map(({ when, ...rest }) => ({
      when: this.makeTokenMatcher(when),
      ...rest
    }));
  }

  compile(path, ctx, lastly) {
    const { compiler, lib, opt } = this;
    const ast = jp.parse(path);
    const despatch = (ast, ctx) => {
      const [tok, ...tail] = ast;

      const next = ctx => {
        if (tail.length) return despatch(tail, ctx);
        return ctx.terminal();
      };

      for (const h of compiler)
        if (h.when(tok)) return h.gen({ ...ctx, next, prepend: [] }, tok);
      throw new Error(`Unhandled token`);
    };

    const ns = {};
    const reqs = new Set();
    const prepend = [];

    const context = {
      lval: "obj",
      prepend: [],

      sym(...pfxs) {
        return pfxs.map(pfx => `${pfx}${(ns[pfx] = (ns[pfx] || 0) + 1)}`);
      },

      terminal() {
        if (this.trackPath)
          return `const path = stack.flat(); ${this.lastly(this)}`;
        return this.lastly(this);
      },

      code(...lines) {
        return [...this.prepend, ...lines].join("\n");
      },

      use(req) {
        if (reqs.has(req)) return this;
        reqs.add(req);
        const lo = lib[req];
        if (!lo) throw new Error(`No ${req} in library`);
        for (const dep of lo.use || []) this.use(dep);
        prepend.push(`// use ${req}`, lo.code.join("\n"), "\n");
        return this;
      },

      frame() {
        const [v] = this.sym("v");
        this.prepend.push(`const ${v} = ${this.lval};`);
        this.lval = v;
        return this;
      },

      chainNext(lvx) {
        if (lvx) {
          if (Array.isArray(lvx)) return this.next({ ...this, lval: lvx[0] });
          return this.next({ ...this, lval: this.lval + lvx });
        }
        return this.next(this);
      },

      chain(part, lvx) {
        const n = this.chainNext(lvx);
        if (!this.trackPath) return n;
        return `stack.push(${part}); ${n}; stack.pop();`;
      },

      block(part, lvx) {
        return `{ ${this.chain(part, lvx)} }`;
      },

      lastly,

      ...ctx
    };

    if (ctx.trackPath) {
      prepend.push(`const stack = []`);
    }

    const code = despatch(ast, context);

    return [...prepend, `// ${path} on ${context.lval}`, code].join("\n");
  }
}

module.exports = Compiler;
