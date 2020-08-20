"use strict";

const sg = require("simple-git");
const path = require("path");
const fs = require("fs");
const del = require("del");
const mkdirp = require("mkdirp");

class Checkout {
  constructor(opt) {
    this.opt = Object.assign(
      {
        cache: ".bm"
      },
      opt || {}
    );
  }

  workDir(what) {
    return path.join(this.opt.cache, what);
  }

  async gotThings(dir, ...files) {
    try {
      const a = await Promise.all(
        files.map(f => fs.promises.access(path.join(dir, f)))
      );
      return true;
    } catch (e) {
      return false;
    }
  }

  async clone(dir) {
    const tmp = dir + ".tmp";

    await del(tmp);
    const made = await mkdirp(tmp);
    const git = sg({ baseDir: tmp });
    await git.clone(process.cwd(), ".");
    await fs.promises.rename(tmp, dir);
  }

  async checkout(what) {
    const dir = this.workDir(what);

    const exists = await this.gotThings(dir, ".git", "package.json");
    if (!exists) await this.clone(dir);
    const git = sg({ baseDir: dir });

    await git.checkout("master");
    await git.pull();
    await git.checkout(what);

    return dir;
  }
}

module.exports = Checkout;
