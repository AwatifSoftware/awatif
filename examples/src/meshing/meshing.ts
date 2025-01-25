// 1. Create a Function

// Develop a function named meshing.
// Input: Building type.
// Output: Structure type.
// Focus on Geometry

// 2. Ignore load and section assignments for now.
// Concentrate on visualizing the mesh geometry.
// Set Up an Example

// 3. Add a new example called Meshing in the examples folder.
// Visualize a 2-story building using the existing mesh visualization tools.
// Prepare for Next Steps

// Plan to implement load and section assignments in subsequent iterations.
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

export function meshing(building: Building): Structure {
  const nodesState: State<Node[]> = van.state([]);
  const elementsState: State<Element[]> = van.state([]);
  const analysisInputsState: State<AnalysisInputs> = van.state({});
  const analysisOutputsState: State<AnalysisOutputs> = van.state({});

  // slabs
  van.derive(() => {
    for (let story in building.stories.rawVal) {
      const pointIndex = building.stories.rawVal[story];
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
