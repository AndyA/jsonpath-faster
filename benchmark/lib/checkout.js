"use strict";

const sg = require("simple-git");
const path = require("path");
const fs = require("fs");
const del = require("del");
const mkdirp = require("mkdirp");

const slotBoard = () => {
  const slots = {};
  return (key, getter) =>
    (slots[key] =
      slots[key] ||
      Promise.resolve(getter(key)).finally(res => {
        delete slots[key];
        return res;
      }));
};

class Checkout {
  constructor(opt) {
    this.opt = Object.assign(
      {
        cache: ".bm"
      },
      opt || {}
    );
    this.sb = slotBoard();
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

    return await this.sb(what, async what => {
      const exists = await this.gotThings(dir, ".git", "package.json");
      if (!exists) await this.clone(dir);
      const git = sg({ baseDir: dir });

      await git.checkout("main");
      await git.pull();
      await git.checkout(what);

      return dir;
    });
  }
}

module.exports = Checkout;
