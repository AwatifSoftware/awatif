import van, { State } from "vanjs-core";
import {
  Building,
  Structure,
  Node,
  Element,
  AnalysisInputs,
  AnalysisOutputs,
} from "awatif-data-structure";
import { parameters, Parameters, viewer } from "awatif-ui";
import { meshing } from "./meshing";

const params: Parameters = {
  frameMeshDensity: {
    value: van.state(3),
    min: 1,
    max: 5,
    step: 1,
    label: "frame mesh density",
  },
  width: { value: van.state(10), min: 5, max: 20 },
  height: { value: van.state(3), min: 1, max: 5 },
  floorLoad: { value: van.state(10), min: 0, max: 20, label: "floor load" },
};

const nodesState: State<Node[]> = van.state([]);
const elementsState: State<Element[]> = van.state([]);
const analysisInputsState: State<AnalysisInputs> = van.state({});
const analysisOutputsState: State<AnalysisOutputs> = van.state({});

// Events: on parameter change
van.derive(() => {
  const floorWidth = params.width.value.val;
  const storeyHeight = params.height.value.val;
  const floorLoad = params.floorLoad.value.val;

  const building: Building = {
    points: van.state([
      [0, 0, 0],
      [0, 0, storeyHeight],
      [floorWidth, 0, storeyHeight],
      [floorWidth, floorWidth, storeyHeight],
      [0, floorWidth, storeyHeight],
      [0, 0, storeyHeight * 2],
      [floorWidth, 0, storeyHeight * 2],
      [floorWidth, floorWidth, storeyHeight * 2],
      [0, floorWidth, storeyHeight * 2],
    ]),
    stories: van.state([0, 1, 5]),
    columns: van.state([1, 2, 3, 4]),
    slabs: van.state([
      [1, 2, 3, 4],
      [5, 6, 7, 8],
    ]),
    columnsByStory: van.state(
      new Map([
        [0, []],
        [1, [0, 1, 2, 3]],
        [2, [0, 1, 2, 3]],
      ])
    ),
    slabsByStory: van.state(
      new Map([
        [0, []],
        [1, [0]],
        [2, [1]],
      ])
    ),
    columnData: van.state(
      new Map([
        [0, {}],
        [1, {}],
        [2, {}],
        [3, {}],
      ])
    ),
    slabData: van.state(
      new Map([
        [
          0,
          {
            analysisInput: {
              areaLoad: floorLoad,
              isOpening: false,
            },
          },
        ],
        [
          1,
          {
            analysisInput: {
              areaLoad: floorLoad,
              isOpening: false,
            },
          },
        ],
      ])
    ),
  };

  const structure: Structure = meshing(
    building,
    params.frameMeshDensity.value.val
  );

  // update state
  nodesState.val = structure.nodes.val;
  elementsState.val = structure.elements.val;
  analysisInputsState.val = structure.analysisInputs.val;
  analysisOutputsState.val = structure.analysisOutputs.val;
});

document.body.append(
  parameters(params),
  viewer({
    structure: {
      nodes: nodesState,
      elements: elementsState,
      analysisInputs: analysisInputsState,
      analysisOutputs: analysisOutputsState,
    },
    settingsObj: {
      nodes: true,
    },
  })
);
