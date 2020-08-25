"use strict";

function JSONPath() {
  const self = function(template, ...args) {
    return {
      spill() {
        return { template, args };
      }
    };
  };

  self.apply = function() {
    console.log("Apply!");
  };

  return self;
}

const jp = new JSONPath();

const i = 0,
  j = 1;

const x = jp`$.slot[${i}][${j}]`.spill();
console.log(x);
jp.apply();
