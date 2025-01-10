import {
  Node,
  Element,
  NodeInputs,
  ElementInputs,
  DeformOutputs,
} from "awatif-data-structure";
import { flatten, lusolve, multiply, subset, index } from "mathjs";
import { getStiffnesses } from "./utils/getStiffnesses";

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
    const hasReaction = nodeInputs.supports?.get(i);

    deformations.set(i, [
      deformationsArray[i * 6],
      deformationsArray[i * 6 + 1],
      deformationsArray[i * 6 + 2],
      deformationsArray[i * 6 + 3],
      deformationsArray[i * 6 + 4],
      deformationsArray[i * 6 + 5],
    ]);

    if (hasReaction) {
      reactions.set(i, [
        reactionsArray[i * 6],
        reactionsArray[i * 6 + 1],
        reactionsArray[i * 6 + 2],
        reactionsArray[i * 6 + 3],
        reactionsArray[i * 6 + 4],
        reactionsArray[i * 6 + 5],
      ]);
    }
  });

  return {
    deformations,
    reactions,
  };
}

// Utils
function getFreeIndices(
  supportsInputs: NodeInputs["supports"],
  elementInputs: ElementInputs,
  elements: Element[],
  dof: number
): number[] {
  const supportsIndexes: number[] = [];
  supportsInputs?.forEach((support, index) => {
    if (support[0]) supportsIndexes.push(index * 6);
    if (support[1]) supportsIndexes.push(index * 6 + 1);
    if (support[2]) supportsIndexes.push(index * 6 + 2);
    if (support[3]) supportsIndexes.push(index * 6 + 3);
    if (support[4]) supportsIndexes.push(index * 6 + 4);
    if (support[5]) supportsIndexes.push(index * 6 + 5);
  });

  // Todo: find a better way to incorporate bar and beams
  const barNodes = new Set<number>();
  elementInputs?.momentsOfInertiaY?.forEach((momentOfInertiaY, index) => {
    if (!momentOfInertiaY) {
      const element = elements[index];
      barNodes.add(element[0]);
      barNodes.add(element[1]);
    }
  });
  elementInputs?.momentsOfInertiaZ?.forEach((momentOfInertiaZ, index) => {
    if (!momentOfInertiaZ) {
      const element = elements[index];
      barNodes.add(element[0]);
      barNodes.add(element[1]);
    }
  });

  const rotationIndexes: number[] = [];
  barNodes.forEach((index) => {
    rotationIndexes.push(index * 6 + 3);
    rotationIndexes.push(index * 6 + 4);
    rotationIndexes.push(index * 6 + 5);
  });

  return Array(dof)
    .fill(0)
    .map((_, i) => i)
    .filter(
      (v) => !supportsIndexes.includes(v) && !rotationIndexes.includes(v)
    );
}

function getAppliedForces(
  forcesInputs: NodeInputs["loads"],
  dof: number
): number[] {
  const forces: number[] = Array(dof).fill(0);

  forcesInputs?.forEach((force, index) => {
    forces[index * 6] = force[0];
    forces[index * 6 + 1] = force[1];
    forces[index * 6 + 2] = force[2];
    forces[index * 6 + 3] = force[3];
    forces[index * 6 + 4] = force[4];
    forces[index * 6 + 5] = force[5];
  });

  return forces;
}
