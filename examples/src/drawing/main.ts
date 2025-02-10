import van, { State } from "vanjs-core";
import { Element, Node } from "awatif-data-structure";
import { viewer, Drawing, Parameters, parameters } from "awatif-ui";
import { toolbar } from "./toolbar";

// Init
const nodes: State<Node[]> = van.state([]);
const elements: State<Element[]> = van.state([]);

const points1st: Drawing["points"] = van.state([
  [5, 5, 0],
  [10, 15, 0],
  [15, 10, 0],
]);
const points2nd: Drawing["points"] = van.state([
  [10, 2, 5],
  [2, 2, 5],
  [2, 10, 5],
  [7, 10, 5],
]);
const polylines1st: Drawing["polylines"] = van.state([]);
const polylines2nd: Drawing["polylines"] = van.state([[0, 1, 2, 3], []]);

const points: Drawing["points"] = van.state([]);
const polylines: Drawing["polylines"] = van.state([]);

const params: Parameters = {
  width: { value: van.state(2), min: 0.5, max: 5, step: 0.1 },
};

const gridTarget = van.state({
  position: [10, 10, 0] as [number, number, number],
  rotation: [Math.PI / 2, 0, 0] as [number, number, number],
});

const floorHeight = 5;

// Update
points.val = points1st.val;

// Events
let activeFloor = "1st-floor";
// On toolbar click, update grid target and points
function onToolbarClick(floor: string) {
  activeFloor = floor;

  gridTarget.val = {
    position: [10, 10, floor === "1st-floor" ? 0 : floorHeight] as [
      number,
      number,
      number
    ],
    rotation: [Math.PI / 2, 0, 0] as [number, number, number],
  };

  points.val = floor === "1st-floor" ? points1st.val : points2nd.val;
  polylines.val = floor === "1st-floor" ? polylines1st.val : polylines2nd.val;
}

// On point or polyline change, update floor points
van.derive(() => {
  if (activeFloor == "1st-floor") {
    points1st.val = points.val;
    polylines1st.val = polylines.val;
  }
  if (activeFloor == "2nd-floor") {
    points2nd.val = points.val;
    polylines2nd.val = polylines.val;
  }
});

// On point change create columns and slabs
van.derive(() => {
  nodes.val = [];
  elements.val = [];

  // create columns
  const columnsNodes: Node[] = [];
  const columnsElements: Element[] = [];
  points1st.val.forEach((point, pointIndex) => {
    const { columnNodes, columnElements } = createThreeColumns(
      pointIndex * 4,
      point,
      floorHeight,
      params.width.value.val
    );

    columnsNodes.push(...columnNodes);
    columnsElements.push(...columnElements);
  });

  // create slabs
  const slabsNodes: Node[] = [];
  points2nd.val.forEach((point, pointIndex) => {
    slabsNodes.push(point);
  });

  const slabsElements: Element[] = [];
  const baseIndex = columnsNodes.length;
  polylines2nd.val.forEach((polyline, polylineIndex) => {
    const newPolyline = polyline.map((v) => baseIndex + v);
    slabsElements.push(newPolyline);
  });

  // add columns and slabs
  nodes.val = [...nodes.rawVal, ...columnsNodes, ...slabsNodes];
  elements.val = [...elements.rawVal, ...columnsElements, ...slabsElements];
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
      polylines,
      gridTarget,
    },
  }),
  toolbar({ onToolbarClick })
);

// Utils
function createThreeColumns(
  baseIndex: number,
  baseNode: Node,
  height: number,
  width: number
): { columnNodes: Node[]; columnElements: Element[] } {
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

  return { columnNodes: newNodes, columnElements: newElements };
}
