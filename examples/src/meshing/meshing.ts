import van, { State } from "vanjs-core";
import {
  Node,
  Element,
  AnalysisInputs,
  AnalysisOutputs,
  Structure,
  Building,
} from "awatif-data-structure";
import { mesh } from "awatif-mesh";
import { subtract, divide, add, multiply, column } from "mathjs";

export function meshing(building: Building): Structure {
  const nodesState: State<Node[]> = van.state([]);
  const elementsState: State<Element[]> = van.state([]);
  const analysisInputsState: State<AnalysisInputs> = van.state({});
  const analysisOutputsState: State<AnalysisOutputs> = van.state({});

  // slabs
  van.derive(() => {
    for (let story in building.stories.val) {
      const pointIndex = building.stories.val[story];
      const elevation = building.points.val[pointIndex][2];
      const slabsIndices: number[] = building.slabsByStory.val.get(
        Number(story)
      );
      slabsIndices.forEach((i) => {
        const slab: number[] = building.slabs.val[i];
        const points = van.state(
          slab.map((s) => [
            building.points.val[s][0],
            building.points.val[s][1],
          ])
        );
        const polygon = van.state(points.val.map((_, i) => i));
        const { nodes, elements } = mesh({ points, polygon });

        const numExistingNodes = nodesState.val.length;

        nodesState.val = [
          ...nodesState.val,
          ...meshNodesTo3d(nodes.val, elevation),
        ];
        elementsState.val = [
          ...elementsState.val,
          ...elements.val.map((e) => e.map((i) => i + numExistingNodes)),
        ];
      });
    }
  });

  // columns
  van.derive(() => {
    for (let story = 0; story < building.stories.val.length; story++) {
      const pointIndex = building.stories.val[story];
      const elevation = building.points.val[pointIndex][2];
      const belowElevation =
        story > 0
          ? building.points.val[building.stories.rawVal[story - 1]][2]
          : elevation;
      const columnsIndices: number[] = building.columnsByStory.val.get(story);

      columnsIndices.forEach((i) => {
        const referenceNode: Node =
          building.points.val[building.columns.val[i]];
        const columnTopNode: Node = [
          referenceNode[0],
          referenceNode[1],
          elevation,
        ];
        const columnBottomNode: Node = [
          referenceNode[0],
          referenceNode[1],
          belowElevation,
        ];
        const { nodes: columnNodes, elements: columnElements } = meshMember(
          columnTopNode,
          columnBottomNode,
          nodesState.val.length,
          3 // mesh density
        );

        nodesState.val = [...nodesState.val, ...columnNodes];
        elementsState.val = [...elementsState.val, ...columnElements];
      });
    }
  });

  return {
    nodes: nodesState,
    elements: elementsState,
    analysisInputs: analysisInputsState,
    analysisOutputs: analysisOutputsState,
  };
}

// Utils ---------------------------------------
function meshNodesTo3d(nodes: Node[], elevation: number): Node[] {
  return nodes.map((p) => [p[0], p[2], elevation]);
}

function meshMember(
  node1: Node,
  node2: Node,
  startIndex: number,
  meshDensity: number
): { nodes: Node[]; elements: Element[] } {
  let nodes: Node[] = [[...node1]];
  let elements: Element[] = [];

  const vecMember = subtract(node2, node1);
  const vecMesh = divide(vecMember, meshDensity);

  for (let i = 0; i < meshDensity; i++) {
    nodes.push(add(node1, multiply(vecMesh, i + 1)) as Node);
    elements.push([startIndex + i, startIndex + i + 1]);
  }

  return { nodes: nodes, elements: elements };
}
