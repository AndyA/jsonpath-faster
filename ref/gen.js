const stack = [];

// use isObject
const isObject = o => o === Object(o);

const f1 = (o, cb, self, ...path) => {
  if (Array.isArray(o)) {
    for (let i3 = 0; i3 < o.length; i3 += 1)
      if (o[i3].price) cb(o, i3, ...path, i3);
    for (let i4 = 0; i4 < o.length; i4 += 1) self(o[i4], cb, self, ...path, i4);
  } else if (isObject(o)) {
    for (const i1 in o) if (o[i1].price) cb(o, i1, ...path, i1);
    for (const i2 in o) self(o[i2], cb, self, ...path, i2);
  }
};

function* f1g(o, self, ...path) {
  if (Array.isArray(o)) {
    for (let i3 = 0; i3 < o.length; i3 += 1)
      if (o[i3].price) yield [o, i3, ...path, i3];
    for (let i4 = 0; i4 < o.length; i4 += 1)
      yield* self(o[i4], self, ...path, i4);
  } else if (isObject(o)) {
    for (const i1 in o) if (o[i1].price) yield [o, i1, ...path, i1];
    for (const i2 in o) yield* self(o[i2], self, ...path, i2);
  }
}

function* it(obj) {
  stack.push("$");
  for (const [o, i, ...part] of f1g(obj, f1g)) {
    stack.push(part);
    const path = stack.flat();
    yield { value: o[i], path };
    stack.pop();
  }
  stack.pop();
}

const obj = {
  store: {
    book: [
      {
        category: "reference",
        author: "Nigel Rees",
        title: "Sayings of the Century",
        price: 8.95
      },
      {
        category: "fiction",
        author: "Evelyn Waugh",
        title: "Sword of Honour",
        price: 12.99
      },
      {
        category: "fiction",
        author: "Herman Melville",
        title: "Moby Dick",
        isbn: "0-553-21311-3",
        price: 8.99
      },
      {
        category: "fiction",
        author: "J. R. R. Tolkien",
        title: "The Lord of the Rings",
        isbn: "0-395-19395-8",
        price: 22.99
      }
    ],
    bicycle: { color: "red", price: 19.95 }
  }
};

for (const rec of it(obj)) {
  console.log(rec);
}
