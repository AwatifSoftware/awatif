import van, { State } from "vanjs-core";
import {
  NodeInputs,
  ElementInputs,
  DeformOutputs,
  AnalyzeOutputs,
  Element,
  Node,
} from "awatif-data-structure";
import { analyze, deform } from "awatif-fem";
import { parameters, Parameters, viewer } from "awatif-ui";

// Init
const params: Parameters = {
  length: { value: van.state(10), min: 1, max: 20 },
  height: { value: van.state(10), min: 1, max: 10 },
  xLoad: { value: van.state(10), min: 0, max: 10, folder: "Loads" },
  area: { value: van.state(10), min: 1, max: 10, folder: "Sections" },
};

const nodes: State<Node[]> = van.state([]);
const elements: State<Element[]> = van.state([]);
const nodeInputs: State<NodeInputs> = van.state({});
const elementInputs: State<ElementInputs> = van.state({});
const deformOutputs: State<DeformOutputs> = van.state({});
const analyzeOutputs: State<AnalyzeOutputs> = van.state({});

// Events: on parameter change
van.derive(() => {
  const length = params.length.value.val;
  const height = params.height.value.val;
  const xLoad = params.xLoad.value.val;
  const area = params.area.value.val;

  nodes.val = [
    [0, 0, 0],
    [0, 0, height],
    [length, 0, height],
    [length, 0, 0],
  ];
  elements.val = [
    [0, 1],
    [1, 2],
    [2, 3],
  ];

  nodeInputs.val = {
    supports: new Map([
      [0, [true, true, true, true, true, true]],
      [3, [true, true, true, true, true, true]],
    ]),
    loads: new Map([[2, [xLoad, 0, 0, 0, 0, 0]]]),
  };

  elementInputs.val = {
    elasticities: new Map(elements.val.map((_, i) => [i, 10])),
    shearModuli: new Map(elements.val.map((_, i) => [i, 10])),
    areas: new Map(elements.val.map((_, i) => [i, area])),
    torsionalConstants: new Map(elements.val.map((_, i) => [i, 10])),
    momentsOfInertiaY: new Map(elements.val.map((_, i) => [i, 10])),
    momentsOfInertiaZ: new Map(elements.val.map((_, i) => [i, 10])),
  };

  deformOutputs.val = deform(
    nodes.val,
    elements.val,
    nodeInputs.val,
    elementInputs.val
  );

  analyzeOutputs.val = analyze(
    nodes.val,
    elements.val,
    elementInputs.val,
    deformOutputs.val
  );
});

document.body.append(
  parameters(params),
  viewer({
    structure: {
      nodes,
      elements,
      nodeInputs,
      elementInputs,
      deformOutputs,
      analyzeOutputs,
    },
    settingsObj: {
      deformedShape: true,
    },
  })
);
