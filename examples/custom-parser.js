const jpf = require("..");

const { parse, stringify } = jpf;

const reverse = str =>
  str.length < 2 ? str : reverse(str.substr(1)) + str.substr(0, 1);

const jp = jpf.JSONPath({
  parse: path => parse(reverse(path)),
  stringify: ast => reverse(stringify(ast))
});

const doc = {
  id: "0001",
  name: "Pizzo!",
  defects: ["entitled", "transactional", "disagreeable"]
};

for (let i = 0; i < 5; i++) {
  const nodes = jp.string.leaf.nodes(doc, "*..$");
  const skel = Object.fromEntries(
    nodes.map(({ path, value }) => [path, value])
  );
  console.log(skel);
}
