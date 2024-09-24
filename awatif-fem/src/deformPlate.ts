import { Node, QuadrilateralElement, AnalysisInputs } from "awatif-data-structure";
import { flatten, lusolve, multiply, subset, index } from "mathjs";
import { getStiffnesses } from "./utils/getStiffnesses";
import { getFreeIndices } from "./utils/getFreeIndices";
import { getAppliedForces } from "./utils/getAppliedForces";

export function deform(
  nodes: Node[],
  elements: QuadrilateralElement[],
  analysisInputs: AnalysisInputs
): { deformations: number[]; reactions: number[] } {
  const dof = nodes.length * 3;

  const freeInd = getFreeIndices(
    analysisInputs.pointSupports,
    analysisInputs.sections,
    elements,
    dof
  );

  const appliedForces = getAppliedForces(analysisInputs.pointLoads, dof);

  const stiffnesses = getStiffnesses(
    nodes,
    elements,
    analysisInputs.materials,
    analysisInputs.sections,
    dof
  );

  const f = subset(appliedForces, index(freeInd));
  const K = subset(stiffnesses, index(freeInd, freeInd));
  const d = lusolve(K, f) as number[];

  const deformations: number[] = subset(
    Array(dof).fill(0),
    index(freeInd),
    flatten(d)
  );

  const reactions = multiply(stiffnesses, deformations);

  return {
    deformations,
    reactions,
  };
}
