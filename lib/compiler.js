"use strict";

const jp = require("jsonpath");

const isObject = o => o === Object(o);

class Compiler {
  constructor(structureCompiler, selectorCompiler, lib, opt) {
    this.structureCompiler = this.constructor.makeLadder(structureCompiler);
    this.selectorCompiler = this.constructor.makeLadder(selectorCompiler);

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

  makeContext(ctx) {
    const { structureCompiler, selectorCompiler, lib, opt } = this;
    const ns = {};
    const reqs = new Set();
    const functions = {};

    const context = {
      lval: "obj",
      prepend: [],
      preamble: [],

      despatch(ast) {
        const [tok, ...tail] = ast;

        const next = ctx => {
          if (tail.length) return (ctx || this).despatch(tail);
          return (ctx || this).terminal();
        };

        for (const h of structureCompiler)
          if (h.when(tok)) return h.gen({ ...this, next, prepend: [] }, tok);

        throw new Error(`Unhandled token in structureCompiler`);
      },

      selector(tok) {
        const resolve = tok => {
          for (const h of selectorCompiler)
            if (h.when(tok)) return h.gen(this, tok);

          throw new Error(`Unhandled token in selectorCompiler`);
        };
        const sel = resolve(tok);
        return { array: sel.code, object: sel.code, ...sel };
      },

      sym(...pfxs) {
        return pfxs.map(pfx => `${pfx}${(ns[pfx] = (ns[pfx] || 0) + 1)}`);
      },

      addFunction(defn) {
        return (functions[defn] = functions[defn] || this.sym("f"));
      },

      terminal() {
        if (this.trackPath)
          return `const path = stack.flat(); ${this.lastly(this)}`;
        return this.lastly(this);
      },

      code(...lines) {
        return [...this.prepend, ...lines].join("\n");
      },

      fork(obj) {
        return obj;
      },

      use(req) {
        if (reqs.has(req)) return this;
        reqs.add(req);
        const lo = lib[req];
        if (!lo) throw new Error(`No ${req} in library`);
        for (const dep of lo.use || []) this.use(dep);
        this.preamble.push(`// use ${req}`, lo.code.join("\n"), "\n");
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

      // TODO don't think we need to do any adorning.
      adorn(code, wrapper) {
        if (isObject(code)) {
          const out = {};
          for (const key in code) out[key] = this.adorn(code[key], wrapper);
          return out;
        }

        return wrapper(code);
      },

      chain(part, lvx) {
        const next = this.chainNext(lvx);
        if (!this.trackPath) return next;
        return this.adorn(
          next,
          frag => `stack.push(${part}); ${frag}; stack.pop()`
        );
      },

      block(part, lvx) {
        return `{ ${this.chain(part, lvx)} }`;
      },

      functionDefinitions() {
        return Object.entries(functions).map(
          ([defn, name]) => `const ${name} = ${defn};\n`
        );
      },

      render(ast) {
        const code = this.despatch(ast);

        return [...this.preamble, this.functionDefinitions(), code].join("\n");
      },

      ...ctx
    };

    if (context.trackPath) context.preamble.push(`const stack = []`);

    return context;
  }

  compile(path, ctx) {
    const { structureCompiler, lib, opt } = this;
    const ast = jp.parse(path);

    return this.makeContext(ctx).render(ast);
  }
}

module.exports = Compiler;
