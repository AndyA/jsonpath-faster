const jpf = require("..");
const LRU = require("lru-cache");

const jp = jpf.JSONPath({ cache: new LRU(1000) });

const doc = {
  id: "0001",
  name: "Pizzo!",
  defects: ["entitled", "transactional", "disagreeable"]
};

for (let i = 0; i < 5; i++) {
  const nodes = jp.string.leaf.nodes(doc, "$..*");
  const skel = Object.fromEntries(
    nodes.map(({ path, value }) => [path, value])
  );
  console.log(skel);
}
