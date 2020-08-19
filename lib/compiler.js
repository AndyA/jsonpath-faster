"use strict";

const jp = require("jsonpath");

const isObject = o => o === Object(o);

class Compiler {
  constructor(structureCompiler, selectorCompiler, lib, opt) {
    const me = this.constructor;
    this.structureCompiler = me.makeLadder(structureCompiler);
    this.selectorCompiler = me.makeLadder(selectorCompiler);
    this.vivifierCompiler = me.makeLadder(require("./compilers/vivifiers"));

    this.lib = lib;
    this.opt = Object.assign({}, opt || {});
  }

  static makeTokenMatcher(test) {
    if (typeof test === "function") return test;

    const match = (obj, test) => {
      if (obj === undefined) return false;
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

  makeContext(context) {
    const {
      structureCompiler,
      selectorCompiler,
      vivifierCompiler,
      lib,
      opt
    } = this;

    const ns = {};
    const reqs = new Set();
    const functions = {};

    const ctx = {
      lval: "obj",
      prepend: [],
      preamble: [],
      appendix: [],

      despatch(ast) {
        const [tok, ...tail] = ast;

        const next = context => {
          if (tail.length) return (context || this).despatch(tail);
          return (context || this).terminal();
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

      vivifyTokens(ast) {
        const viv = tok => {
          for (const h of vivifierCompiler) if (h.when(tok)) return h.gen(tok);
        };

        const out = [];
        let tp = ast.length - 1;
        let vv = true;

        while (tp >= 0) {
          const tok = ast[tp];
          const nvv = viv(tok);
          if (!nvv) break; // stop when we hit one that won't vivify
          out.unshift((vv && { ...tok, vv }) || tok);
          vv = nvv;
          tp--;
        }

        while (tp >= 0) out.unshift(ast[tp--]);
        console.log(JSON.stringify({ ast, out }, null, 2));
        return out;
      },

      sym(...pfxs) {
        return pfxs.map(pfx => `${pfx}${(ns[pfx] = (ns[pfx] || 0) + 1)}`);
      },

      addFunction(defn) {
        return (functions[defn] = functions[defn] || this.sym("f"));
      },

      defineFunction(args, defn) {
        if (this.counted) defn = `if (count <= 0) return; ${defn}`;
        return this.addFunction(`(${args}) => { ${defn} }`);
      },

      terminal() {
        let frag = this.lastly(this);
        if (this.trackPath) frag = `const path = stack.flat(); ${frag}`;
        if (this.counted) frag = `if (count-- <= 0) return; ${frag}`;
        return frag;
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
        this.preamble.push(`// use ${req}`, lo.code.join("\n"), "\n");
        return this;
      },

      chainNext(lvx) {
        if (lvx) {
          const ch = lval => this.next({ ...this, plval: this.lval, lval });
          if (Array.isArray(lvx)) return ch(lvx[0]);
          return ch(this.lval + lvx);
        }
        return this.next(this);
      },

      chain(part, lvx) {
        const next = this.chainNext(lvx);
        if (!this.trackPath) return next;
        return `stack.push(${part}); ${next}; stack.pop()`;
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
        const code = this.despatch(this.vivify ? this.vivifyTokens(ast) : ast);

        return [
          ...this.preamble,
          ...this.functionDefinitions(),
          code,
          ...this.appendix
        ].join("\n");
      },

      ...context
    };

    if (ctx.trackPath) ctx.preamble.push(`const stack = []`);

    return ctx;
  }

  compileTokens(ast, context) {
    return this.makeContext(context).render(ast);
  }

  compile(path, context) {
    return this.compileTokens(jp.parse(path), context);
  }
}

module.exports = Compiler;
