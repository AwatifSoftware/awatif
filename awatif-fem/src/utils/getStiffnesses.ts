import { Node, Element, ElementInputs } from "awatif-data-structure";
import { multiply, norm, subtract, transpose } from "mathjs";
import { getTransformationMatrix } from "./getTransformationMatrix";
import { getStiffness } from "./getStiffness";

export function getStiffnesses(
  nodes: Node[],
  elements: Element[],
  elementInputs: ElementInputs,
  dof: number
): number[][] {
  let stiffnesses = Array(dof)
    .fill(0)
    .map(() => Array(dof).fill(0));

  elements.forEach((element, index) => {
    const [e0, e1] = element;

    const xi0 = nodes[e0];
    const xi1 = nodes[e1];
    const L = norm(subtract(xi1, xi0)) as number;

    const kLocal = getStiffness(elementInputs, index, L);
    const T = getTransformationMatrix(xi0, xi1);
    const kGlobal = multiply(transpose(T), multiply(kLocal, T));

    stiffnesses = assembleStiffnessesBeam(stiffnesses, kGlobal, e0, e1);
  });

  return stiffnesses;
}

function assembleStiffnessesBeam(
  stiffnesses: number[][],
  k: number[][],
  i0: number,
  i1: number
): number[][] {
  const offset0 = 6 * i0;
  const offset1 = 6 * i1;

  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 6; j++) {
      stiffnesses[offset0 + i][offset0 + j] += k[i][j];
      stiffnesses[offset1 + i][offset0 + j] += k[i + 6][j];
      stiffnesses[offset0 + i][offset1 + j] += k[i][j + 6];
      stiffnesses[offset1 + i][offset1 + j] += k[i + 6][j + 6];
    }
  }

  return stiffnesses;
}
