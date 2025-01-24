import van, { State } from "vanjs-core";
import { Element, Node } from "awatif-data-structure";
import { viewer, Drawing, Parameters, parameters } from "awatif-ui";

// Init
const nodes: State<Node[]> = van.state([]);
const elements: State<Element[]> = van.state([]);
const points: Drawing["points"] = van.state([
  [5, 5, 0],
  [15, 15, 0],
]);

const params: Parameters = {
  height: { value: van.state(5), min: 0.5, max: 15, step: 0.1 },
  width: { value: van.state(3), min: 0.5, max: 5, step: 0.1 },
};

// Events
// On points change draw nodes
van.derive(() => {
  nodes.val = [];
  elements.val = [];

  points.val.forEach((point, pointIndex) => {
    const { newNodes, newElements } = createThreeColumns(
      pointIndex * 4,
      point,
      params.height.value.val,
      params.width.value.val
    );

    nodes.val = [...nodes.rawVal, ...newNodes];
    elements.val = [...elements.rawVal, ...newElements];
  });
});

document.body.append(
  parameters(params),
  viewer({
    structure: {
      nodes,
      elements,
    },
    drawingObj: {
      points,
    },
  })
);

// Utils
function createThreeColumns(
  baseIndex: number,
  baseNode: Node,
  height: number,
  width: number
): { newNodes: Node[]; newElements: Element[] } {
  const x = baseNode[0];
  const y = baseNode[1];

  const newNodes: Node[] = [
    baseNode,
    [x - 0.5 * width, y - 0.5 * width, height],
    [x + 0.5 * width, y - 0.5 * width, height],
    [x, y + 0.5 * width, height],
  ];
  const newElements: Element[] = [
    [baseIndex, baseIndex + 1],
    [baseIndex, baseIndex + 2],
    [baseIndex, baseIndex + 3],
  ];

  return { newNodes, newElements };
}
