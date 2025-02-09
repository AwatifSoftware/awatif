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
import { subtract, divide, add, multiply, column, cross, norm } from "mathjs";

export function meshing(
  building: Building,
  frameMeshDensity: number = 3
): Structure {
  const nodesState: State<Node[]> = van.state([]);
  const elementsState: State<Element[]> = van.state([]);
  const analysisInputsState: State<AnalysisInputs> = van.state({
    materials: new Map(),
    sections: new Map(),
    pointSupports: new Map(),
    pointLoads: new Map(),
  });
  const analysisOutputsState: State<AnalysisOutputs> = van.state({
    nodes: new Map(),
    elements: new Map(),
  });

  // slabs
  van.derive(() => {
    for (let story in building.stories.val) {
      // slab geometry --------------------------------
      const pointIndex = building.stories.val[story];
      const elevation = building.points.val[pointIndex][2];
      const slabsIndices: number[] = building.slabsByStory.val.get(
        Number(story)
      );
      slabsIndices.forEach((slabIndex) => {
        const slab: number[] = building.slabs.val[slabIndex];
        const points = van.state(
          slab.map((s) => [
            building.points.val[s][0],
            building.points.val[s][1],
          ])
        );
        const polygon = van.state(points.val.map((_, i) => i));
        const { nodes, elements } = mesh({ points, polygon });

        const numExistingNodes = nodesState.val.length;
        const newNodesIndices = nodes.val.map((_, i) => i + numExistingNodes);
        const slabElements = elements.val.map((e) =>
          e.map((i) => i + numExistingNodes)
        );

        nodesState.val = [
          ...nodesState.val,
          ...convertMeshNodesTo3d(nodes.val, elevation),
        ];
        elementsState.val = [...elementsState.val, ...slabElements];

        // slab loads ----------------------------------------------------------------
        const areaLoad =
          building.slabData.val.get(slabIndex)["analysisInput"].areaLoad;
        analysisInputsState.val = getNodalLoadsFromSlabAreaLoad(
          nodesState.val,
          slabElements,
          analysisInputsState.val,
          areaLoad,
          newNodesIndices
        );
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
          frameMeshDensity
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
function convertMeshNodesTo3d(nodes: Node[], elevation: number): Node[] {
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
  const vecSegment = divide(vecMember, meshDensity);

  for (let i = 0; i < meshDensity; i++) {
    nodes.push(add(node1, multiply(vecSegment, i + 1)) as Node);
    elements.push([startIndex + i, startIndex + i + 1]);
  }

  return { nodes: nodes, elements: elements };
}

function getNodalLoadsFromSlabAreaLoad(
  nodes: Node[],
  storySlabElements: Element[],
  analysisInputs: AnalysisInputs,
  areaLoad: number,
  slabsNodeIndices: number[]
): AnalysisInputs {
  analysisInputs = structuredClone(analysisInputs);
  // 1. iterate over elements
  storySlabElements.forEach((e) => {
    const elementArea = getTriangleArea(nodes[e[0]], nodes[e[1]], nodes[e[2]]);
    const nodalLoad = (areaLoad * elementArea) / 3;
    e.forEach((n) => {
      if (slabsNodeIndices.includes(n)) {
        if (analysisInputs.pointLoads.has(n)) {
          analysisInputs.pointLoads.set(
            n,
            add(analysisInputs.pointLoads.get(n), [0, 0, -nodalLoad, 0, 0, 0])
          );
        } else {
          analysisInputs.pointLoads.set(n, [0, 0, -nodalLoad, 0, 0, 0]);
        }
      }
    });
  });

  return analysisInputs;
}

function getTriangleArea(n1: Node, n2: Node, n3: Node): number {
  const a = subtract(n2, n1);
  const b = subtract(n3, n1);

  return (norm(cross(a, b)) as number) / 2;
}
