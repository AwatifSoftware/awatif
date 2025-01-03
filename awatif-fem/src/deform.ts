import {
  Node,
  Element,
  NodeInputs,
  ElementInputs,
  DeformOutputs,
} from "awatif-data-structure";
import { flatten, lusolve, multiply, subset, index } from "mathjs";
import { getStiffnesses } from "./utils/getStiffnesses";
import { getFreeIndices } from "./utils/getFreeIndices";
import { getAppliedForces } from "./utils/getAppliedForces";

export function deform(
  nodes: Node[],
  elements: Element[],
  nodeInputs: NodeInputs,
  elementInputs: ElementInputs
): DeformOutputs {
  const dof = nodes.length * 6;

  const freeInd = getFreeIndices(
    nodeInputs.supports,
    elementInputs,
    elements,
    dof
  );

  const appliedForces = getAppliedForces(nodeInputs.loads, dof);

  const stiffnesses = getStiffnesses(nodes, elements, elementInputs, dof);

  const forcesFree = subset(appliedForces, index(freeInd));
  const stiffnessesFree = subset(stiffnesses, index(freeInd, freeInd));
  const deformationFree = lusolve(stiffnessesFree, forcesFree) as number[];

  const deformationsArray: number[] = subset(
    Array(dof).fill(0),
    index(freeInd),
    flatten(deformationFree)
  );

  const reactionsArray = multiply(stiffnesses, deformationsArray);

  const deformations: DeformOutputs["deformations"] = new Map();
  const reactions: DeformOutputs["reactions"] = new Map();

  nodes.forEach((_, i) => {
    deformations.set(i, [
      deformationsArray[i * 6],
      deformationsArray[i * 6 + 1],
      deformationsArray[i * 6 + 2],
      deformationsArray[i * 6 + 3],
      deformationsArray[i * 6 + 4],
      deformationsArray[i * 6 + 5],
    ]);

    reactions.set(i, [
      reactionsArray[i * 6],
      reactionsArray[i * 6 + 1],
      reactionsArray[i * 6 + 2],
      reactionsArray[i * 6 + 3],
      reactionsArray[i * 6 + 4],
      reactionsArray[i * 6 + 5],
    ]);
  });

  return {
    deformations,
    reactions,
  };
}
