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
  meshDensity: {
    value: van.state(7),
    min: 1,
    max: 7,
    step: 1,
    label: "mesh density",
  },
  span: { value: van.state(10), min: 1, max: 20 },
  height: { value: van.state(10), min: 1, max: 10 },
  load: { value: van.state(10), min: 0, max: 20 },
};

const nodesState: State<Node[]> = van.state([]);
const elementsState: State<Element[]> = van.state([]);
const nodeInputsState: State<NodeInputs> = van.state({});
const elementInputsState: State<ElementInputs> = van.state({});
const deformOutputsState: State<DeformOutputs> = van.state({});
const analyzeOutputsState: State<AnalyzeOutputs> = van.state({});

// Events: on parameter change
van.derive(() => {
  const nodes: Node[] = [];
  const elements: Element[] = [];
  const count = params.meshDensity.value.val;
  const height = params.height.value.val;
  const span = params.span.value.val;
  const load = params.load.value.val;

  // beam 1
  nodes.push(
    ...[...Array(count + 1).keys()].map(
      (i) => [0, 0, (height / count) * i] as Node
    )
  );
  elements.push(...[...Array(count).keys()].map((i) => [i, i + 1] as Element));

  // beam 2
  let s = nodes.length;
  nodes.push(
    ...[...Array(count).keys()].map(
      (i) => [(span / count) * (i + 1), 0, height] as Node
    )
  );
  elements.push(
    ...[...Array(count - 1).keys()].map((i) => [s + i, s + i + 1] as Element)
  );
  elements.push([s - 1, s]); // connecting beam

  // beam 3
  s = nodes.length;
  const loadNode = s - 1;
  nodes.push(
    ...[...Array(count).keys()].map(
      (i) => [span, 0, height - (height / count) * (i + 1)] as Node
    )
  );
  elements.push(
    ...[...Array(count - 1).keys()].map((i) => [s + i, s + i + 1] as Element)
  );
  elements.push([s - 1, s]); // connecting beam

  const nodeInputs: NodeInputs = {
    supports: new Map([
      [0, [true, true, true, true, true, true]],
      [nodes.length - 1, [true, true, true, true, true, true]],
    ]),
    loads: new Map([[loadNode, [load, 0, 0, 0, 0, 0]]]),
  };

  const elementInputs: ElementInputs = {
    elasticities: new Map(elements.map((_, i) => [i, 10])),
    shearModuli: new Map(elements.map((_, i) => [i, 10])),
    areas: new Map(elements.map((_, i) => [i, 10])),
    torsionalConstants: new Map(elements.map((_, i) => [i, 10])),
    momentsOfInertiaY: new Map(elements.map((_, i) => [i, 10])),
    momentsOfInertiaZ: new Map(elements.map((_, i) => [i, 10])),
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
