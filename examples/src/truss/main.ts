import van, { State } from "vanjs-core";
import {
  Node,
  Element,
  NodeInputs,
  ElementInputs,
  DeformOutputs,
  AnalyzeOutputs,
} from "awatif-data-structure";
import { analyze, deform } from "awatif-fem";
import { parameters, Parameters, viewer } from "awatif-ui";

// Init
const params: Parameters = {
  span: {
    value: van.state(15),
    min: 5,
    max: 20,
    step: 1,
    label: "span (m)",
  },
  divisions: {
    value: van.state(5),
    min: 2,
    max: 5,
    step: 1,
  },
  height: {
    value: van.state(2),
    min: 1,
    max: 5,
    step: 0.1,
    label: "height (m)",
  },
  elasticity: {
    value: van.state(10),
    min: 1,
    max: 250,
    step: 1,
    label: "Elasticity (gpa)",
  },
  area: {
    value: van.state(10),
    min: 1,
    max: 300,
    step: 1,
    label: "area (cm2)",
  },
  load: {
    value: van.state(250),
    min: 1,
    max: 500,
    step: 1,
    label: "load (kN)",
  },
};

const nodesState: State<Node[]> = van.state([]);
const elementsState: State<Element[]> = van.state([]);
const nodeInputsState: State<NodeInputs> = van.state({});
const elementInputsState: State<ElementInputs> = van.state({});
const deformOutputsState: State<DeformOutputs> = van.state({});
const analyzeOutputsState: State<AnalyzeOutputs> = van.state({});

// Events: on parameter change
van.derive(() => {
  const span = params.span.value.val;
  const divisions = params.divisions.value.val;
  const height = params.height.value.val;
  const elasticity = params.elasticity.value.val * 1e6;
  const area = params.area.value.val * 1e-4;
  const load = params.load.value.val;

  const nodes: Node[] = [];
  const elements: Element[] = [];
  const dx = span / divisions;

  const bottomChordNodes: Node[] = [];
  for (let i = 0; i <= divisions; i++) {
    const node: Node = [dx * i, 0, 0]; // bottom chord
    nodes.push(node);
    bottomChordNodes.push(node);
  }

  for (let i = 0; i <= divisions; i++) {
    nodes.push([dx * i, 0, height]); // top chord
  }

  // bottom chord
  for (let i = 0; i < divisions; i++) {
    elements.push([i, i + 1]);
  }

  // top chord
  for (let i = 0; i < divisions; i++) {
    elements.push([divisions + 1 + i, divisions + 1 + i + 1]);
  }

  for (let i = 0; i <= divisions; i++) {
    elements.push([i, divisions + 1 + i]); // vertical post
  }

  // diagonal post
  for (let i = 0; i < divisions; i++) {
    if (i < divisions / 2) {
      elements.push([i, divisions + 1 + i + 1]);
    } else {
      elements.push([divisions + 1 + i, i + 1]);
    }
  }

  const nodeInputs: NodeInputs = {
    supports: new Map([
      [0, [true, true, true, true, true, true]],
      [divisions, [true, true, true, true, true, true]],
    ]),
    loads: new Map(bottomChordNodes.map((_, i) => [i, [0, 0, -load, 0, 0, 0]])),
  };

  const elementInputs: ElementInputs = {
    elasticities: new Map(elements.map((_, i) => [i, elasticity])),
    areas: new Map(elements.map((_, i) => [i, area])),
  };

  const deformOutputs = deform(nodes, elements, nodeInputs, elementInputs);

  const analyzeOutputs = analyze(nodes, elements, elementInputs, deformOutputs);

  // update state
  nodesState.val = nodes;
  elementsState.val = elements;
  nodeInputsState.val = nodeInputs;
  elementInputsState.val = elementInputs;
  deformOutputsState.val = deformOutputs;
  analyzeOutputsState.val = analyzeOutputs;
});

document.body.append(
  parameters(params),
  viewer({
    structure: {
      nodes: nodesState,
      elements: elementsState,
      nodeInputs: nodeInputsState,
      elementInputs: elementInputsState,
      deformOutputs: deformOutputsState,
      analyzeOutputs: analyzeOutputsState,
    },
    settingsObj: {
      deformedShape: true,
    },
  })
);
