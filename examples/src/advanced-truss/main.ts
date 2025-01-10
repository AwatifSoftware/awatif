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
import { createTruss } from "./createTruss";

// Init
export const params: Parameters = {
  span: {
    value: van.state(20),
    min: 1,
    max: 20,
    label: "Span (m)",
    folder: "Geometry",
  },
  spacing: {
    value: van.state(2.5),
    min: 1,
    max: 5,
    label: "Spacing (m)",
    folder: "Geometry",
  },
  webType: {
    value: van.state(1),
    min: 1,
    max: 3,
    step: 1,
    label: "Web type",
    folder: "Geometry",
  },
  trimType: {
    value: van.state(1),
    min: 1,
    max: 3,
    step: 1,
    label: "Trim type",
    folder: "Geometry",
  },
  leftHeight: {
    value: van.state(2.5),
    min: 1,
    max: 10,
    step: 0.1,
    label: "Left height (m)",
    folder: "Geometry",
  },
  midHeight: {
    value: van.state(2.5),
    min: 1,
    max: 10,
    step: 0.1,
    label: "Mid height (m)",
    folder: "Geometry",
  },
  rightHeight: {
    value: van.state(2.5),
    min: 1,
    max: 10,
    step: 0.1,
    label: "Right height (m)",
    folder: "Geometry",
  },
  leftOffset: {
    value: van.state(0),
    min: 0,
    max: 10,
    step: 0.1,
    label: "Left offset (m)",
    folder: "Geometry",
  },
  midOffset: {
    value: van.state(5),
    min: 0,
    max: 10,
    step: 0.1,
    label: "Mid offset (m)",
    folder: "Geometry",
  },
  rightOffset: {
    value: van.state(0),
    min: 0,
    max: 10,
    step: 0.1,
    label: "Right offset (m)",
    folder: "Geometry",
  },
  supportType: {
    value: van.state(1),
    min: 1,
    max: 2,
    step: 1,
    label: "Support type",
    folder: "Supports",
  },
  uniformLoad: {
    value: van.state(300),
    min: 0,
    max: 1000,
    step: 1,
    label: "Uniform load (KN/m)",
    folder: "Loads",
  },
  chordsArea: {
    value: van.state(50),
    min: 1,
    max: 100,
    step: 1,
    label: "Chords area (cm2)",
    folder: "Sections & Materials",
  },
  chordsElasticity: {
    value: van.state(10),
    min: 1,
    max: 250,
    step: 1,
    label: "Chords elasticity (gpa)",
    folder: "Sections & Materials",
  },
  websArea: {
    value: van.state(50),
    min: 1,
    max: 100,
    step: 1,
    label: "Webs area (cm2)",
    folder: "Sections & Materials",
  },
  websElasticity: {
    value: van.state(10),
    min: 1,
    max: 250,
    step: 1,
    label: "Webs elasticity (gpa)",
    folder: "Sections & Materials",
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
  let span = params.span.value.val;
  let spacing = params.spacing.value.val;
  const webType = params.webType.value.val;
  const trimType = params.trimType.value.val;
  const leftHeight = params.leftHeight.value.val;
  const midHeight = params.midHeight.value.val;
  const rightHeight = params.rightHeight.value.val;
  const leftOffset = params.leftOffset.value.val;
  const midOffset = params.midOffset.value.val;
  const rightOffset = params.rightOffset.value.val;
  const supportType = params.supportType.value.val;
  const uniformLoad = params.uniformLoad.value.val;
  const chordsArea = params.chordsArea.value.val * 1e-4;
  const chordsElasticity = params.chordsElasticity.value.val * 1e6;
  const websArea = params.websArea.value.val * 1e-4;
  const websElasticity = params.websElasticity.value.val * 1e6;

  let nodes: Node[] = [];
  let elements: Element[] = [];
  let supportIndices: number[] = [];
  let loadIndices: number[] = [];
  let chordsIndices: number[] = [];
  let websIndices: number[] = [];

  spacing = span / Math.round(span / spacing); // make sure the span is correct without rounding errors
  const pairTrusses =
    Math.abs(midHeight - 0.5 * (leftHeight + rightHeight)) > 0.3 ||
    Math.abs(midOffset - 0.5 * (leftOffset + rightOffset)) > 0.3;

  if (pairTrusses) {
    span = span / 2;
    spacing = span / Math.round(span / spacing); // new spacing due to new span

    const trimDivisions = Math.round((span - 2 * spacing) / spacing);
    const trim = trimType >= 2 && trimDivisions >= 1;

    // left truss
    const leftHeightSlope = (leftHeight - midHeight) / span;
    const leftHeightTrim = leftHeight - leftHeightSlope * spacing;
    const leftOffsetSlope = (leftOffset - midOffset) / span;
    const leftOffsetTrim = leftOffset - leftOffsetSlope * spacing;

    const {
      nodes: leftNodes,
      elements: leftElements,
      topNodesIndices: leftTopNodesIndices,
      chordsIndices: leftChordsIndices,
      websIndices: leftWebsIndices,
    } = createTruss(
      trim ? span - spacing : span,
      spacing,
      webType,
      trim ? leftHeightTrim : leftHeight,
      midHeight,
      trim ? leftOffsetTrim : leftOffset,
      midOffset,
      trim ? spacing : 0
    );

    nodes.push(...leftNodes);
    elements.push(...leftElements);
    loadIndices.push(...leftTopNodesIndices);
    chordsIndices.push(...leftChordsIndices);
    websIndices.push(...leftWebsIndices);

    // right truss
    const rightHeightSlope = (midHeight - rightHeight) / span;
    const rightOffsetSlope = (midOffset - rightOffset) / span;

    // adjust webType for symmetry
    let adjustWebTyp = webType;
    if (webType === 1) adjustWebTyp = 2;
    if (webType === 2) adjustWebTyp = 1;

    const {
      nodes: rightNodes,
      elements: rightElements,
      topNodesIndices: rightTopNodesIndices,
      chordsIndices: rightChordsIndices,
      websIndices: rightWebsIndices,
    } = createTruss(
      trim ? span - 2 * spacing : span - spacing,
      spacing,
      adjustWebTyp,
      midHeight - rightHeightSlope * spacing,
      trim ? rightHeight + rightHeightSlope * spacing : rightHeight,
      midOffset - rightOffsetSlope * spacing,
      trim ? rightOffset + rightOffsetSlope * spacing : rightOffset,
      span + spacing
    );

    chordsIndices.push(...offset1D(rightChordsIndices, elements.length));
    websIndices.push(...offset1D(rightWebsIndices, elements.length));
    elements.push(...offset2D(rightElements, nodes.length));
    loadIndices.push(...offset1D(rightTopNodesIndices, nodes.length));
    nodes.push(...rightNodes);

    // connecting trim
    if (trim) {
      nodes.push(
        [0, 0, trimType == 3 ? leftHeight + leftOffset : leftOffset],
        [2 * span, 0, trimType == 3 ? rightHeight + rightOffset : rightOffset]
      );
      loadIndices.push(nodes.length - 2, nodes.length - 1);

      // leftTrussNodes + rightTrussNodes
      const leftNodesOffset = (trimDivisions + 1 + 1) * 2;
      const rightNodesOffset = (trimDivisions + 1) * 2;
      const nodesOffset = leftNodesOffset + rightNodesOffset;
      elements.push(
        [0, nodesOffset], // from leftBottom to far left
        [trimDivisions + 2, nodesOffset], // from leftTop to far left
        [leftNodesOffset + trimDivisions, nodesOffset + 1], // from rightBottom to far right
        [leftNodesOffset + rightNodesOffset - 1, nodesOffset + 1] // from rightTop to far right
      );

      chordsIndices.push(
        elements.length - 1,
        elements.length - 2,
        elements.length - 3,
        elements.length - 4
      );
    }

    // connect the pair
    const divisions = trim
      ? Math.round((span - 1 * spacing) / spacing)
      : Math.round(span / spacing);
    const bottomLeft = divisions;
    const bottomRight = (divisions + 1) * 2;
    const topLeft = (divisions + 1) * 2 - 1;
    const topRight = topLeft + divisions + 1;

    if (webType === 1) {
      elements.push(
        [bottomLeft, bottomRight],
        [topLeft, topRight],
        [topLeft, bottomRight]
      );

      chordsIndices.push(elements.length - 3, elements.length - 2);
      websIndices.push(elements.length - 1);
    }
    if (webType === 2) {
      elements.push(
        [bottomLeft, bottomRight],
        [topLeft, topRight],
        [bottomLeft, topRight]
      );

      chordsIndices.push(elements.length - 3, elements.length - 2);
      websIndices.push(elements.length - 1);
    }
    if (webType === 3) {
      elements.push(
        [bottomLeft, bottomRight],
        [topLeft, topRight],
        [bottomLeft, topRight],
        [topLeft, bottomRight]
      );

      chordsIndices.push(elements.length - 4, elements.length - 3);
      websIndices.push(elements.length - 2, elements.length - 1);
    }

    // supports
    if (trim) {
      const trussNodesLength = leftNodes.length + rightNodes.length;
      supportIndices.push(...[trussNodesLength, trussNodesLength + 1]);
    } else {
      if (supportType === 1)
        supportIndices.push(
          ...[0, leftNodes.length + rightNodes.length / 2 - 1]
        );
      else
        supportIndices.push(
          ...[leftNodes.length / 2, leftNodes.length + rightNodes.length - 1]
        );
    }
  } else {
    // not pair of trusses
    const trimDivisions = Math.round((span - 2 * spacing) / spacing);
    const trim = trimType >= 2 && trimDivisions >= 1;
    const heightSlope = (leftHeight - rightHeight) / span;
    const offsetSlope = (leftOffset - rightOffset) / span;

    const {
      nodes: trussNodes,
      elements: trussElements,
      topNodesIndices,
      chordsIndices: trussChordsIndices,
      websIndices: trussWebsIndices,
    } = createTruss(
      trim ? span - 2 * spacing : span,
      spacing,
      webType,
      trim ? leftHeight - heightSlope * spacing : leftHeight,
      trim ? rightHeight + heightSlope * spacing : rightHeight,
      trim ? leftOffset - offsetSlope * spacing : leftOffset,
      trim ? rightOffset + offsetSlope * spacing : rightOffset,
      trim ? spacing : 0
    );

    nodes.push(...trussNodes);
    elements.push(...trussElements);
    loadIndices.push(...topNodesIndices);
    chordsIndices.push(...trussChordsIndices);
    websIndices.push(...trussWebsIndices);

    // connecting trim
    if (trim) {
      nodes.push(
        [0, 0, trimType == 3 ? leftHeight + leftOffset : leftOffset],
        [span, 0, trimType == 3 ? rightHeight + rightOffset : rightOffset]
      );

      loadIndices.push(...[nodes.length - 2, nodes.length - 1]); // for loads

      elements.push(
        [0, (trimDivisions + 1) * 2], // from leftBottom to far left
        [trimDivisions + 1, (trimDivisions + 1) * 2], // from leftTop to far left
        [trimDivisions, (trimDivisions + 1) * 2 + 1], // from rightBottom to far right
        [trimDivisions * 2 + 1, (trimDivisions + 1) * 2 + 1] // from righTop to far right
      );

      chordsIndices.push(
        elements.length - 1,
        elements.length - 2,
        elements.length - 3,
        elements.length - 4
      );
    }

    // supports
    if (trim) {
      supportIndices.push(...[trussNodes.length, trussNodes.length + 1]);
    } else {
      if (supportType === 1)
        supportIndices.push(...[0, trussNodes.length / 2 - 1]);
      else
        supportIndices.push(...[trussNodes.length / 2, trussNodes.length - 1]);
    }
  }

  // Supports and loads
  const nodeInputs: NodeInputs = {
    supports: new Map(
      supportIndices.map((i) => [i, [true, true, true, true, true, true]])
    ),
    loads: new Map(
      loadIndices.map((i) => [i, [0, 0, -uniformLoad * spacing, 0, 0, 0]])
    ),
  };

  const elementInputs: ElementInputs = {
    elasticities: new Map([
      ...(chordsIndices.map((i) => [i, chordsElasticity]) as any),
      ...(websIndices.map((i) => [i, websElasticity]) as any),
    ]),
    areas: new Map([
      ...(chordsIndices.map((i) => [i, chordsArea]) as any),
      ...(websIndices.map((i) => [i, websArea]) as any),
    ]),
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
      loads: false,
    },
  })
);

// Utils
function offset2D(list: Element[], offset: number): Element[] {
  return list.map(([n1, n2]) => [n1 + offset, n2 + offset]);
}

function offset1D(list: number[], offset: number) {
  return list.map((n) => n + offset);
}
