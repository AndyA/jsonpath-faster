"use strict";

const { makeLadder, normalise } = require("./tokens");
const { vivifyTokens } = require("./compilers/vivifiers");
const { mergeOr } = require("./util");

class Compiler {
  constructor(structureCompiler, selectorCompiler, lib, opt) {
    this.structureCompiler = makeLadder(structureCompiler);
    this.selectorCompiler = makeLadder(selectorCompiler);
    this.lib = lib;
    this.opt = Object.assign({}, opt || {});
  }

  makeContext(context) {
    const { structureCompiler, selectorCompiler, lib, opt } = this;

    const ns = {};
    const reqs = new Set();
    const functions = {};

    const ctx = {
      opt: context,
      slot: { o: "obj" },
      preamble: [],
      appendix: [],

      lval() {
        const { o, i } = this.slot;
        if (i !== undefined) return `${o}[${i}]`;
        return o;
      },

      despatch(ast) {
        const [tok, ...tail] = ast;

        const next = ctx => {
          if (tail.length) return ctx.despatch(tail);
          throw new Error(`Unexpected end of AST`);
        };

        for (const h of structureCompiler)
          if (h.when(tok)) return h.gen({ ...this, next }, tok);

        throw new Error(`Unhandled token in structureCompiler`);
      },

      chainNext(lvx) {
        const chainLV = (ctx, lvx) => {
          if (!lvx) return ctx;
          const lval = ctx.lval();
          return { ...ctx, plval: lval, slot: { o: lval, ...lvx } };
        };

        const nctx = chainLV(this, lvx);

        // Clone opt
        const opt = { ...nctx.opt };
        const rv = this.next({ ...nctx, opt });

        // Merge back to our opt
        mergeOr(nctx.opt, opt);
        return rv;
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

      defineFunction(args, defn) {
        if (this.opt.counted) defn = `if (count <= 0) return; ${defn}`;
        return this.addFunction(`(${args}) => { ${defn} }`);
      },

      code(...lines) {
        return lines.join("\n");
      },

      use(req) {
        if (reqs.has(req)) return this;
        reqs.add(req);
        const lo = lib[req];
        if (!lo) throw new Error(`No ${req} in library`);
        // TODO unused, untested
        //        for (const dep of lo.use || []) this.use(dep);
        this.preamble.push(`// use ${req}`, lo.code.join("\n"), "\n");
        return this;
      },

      tracker(part, code) {
        if (part === null || !this.opt.trackPath) return code;
        return `stack.push(${part}); ${code}; stack.pop()`;
      },

      chain(part, lvx) {
        return this.tracker(part, this.chainNext(lvx));
      },

      functionDefinitions() {
        return Object.entries(functions).map(
          ([defn, name]) => `var ${name} = ${defn};\n`
        );
      },

      render(ast) {
        const code = this.despatch(ast);

        if (this.opt.trackPath) ctx.preamble.push(`var stack = []`);

        return [
          ...this.preamble,
          ...this.functionDefinitions(),
          code,
          ...this.appendix
        ].join("\n");
      }
    };

    return ctx;
  }

  compile(ast, context) {
    return this.makeContext(context).render(vivifyTokens(normalise(ast)));
  }
}

module.exports = Compiler;
