import { create, all, MathJsStatic } from 'mathjs';
import { DeformOutputs } from 'awatif-data-structure'; // New type with deformations and reactions maps

// Initialize MathJS
const math: MathJsStatic = create(all);

/**
 * Solves the displacement equation (stiffness * displacement = force) 
 * and maps the computed displacements to node deformations.
 *
 * @param stiffness - The stiffness matrix (as a mathjs Matrix)
 * @param force - The global force vector (flat array of numbers)
 * @param nnodes - The number of nodes in the structure
 * @returns A DeformOutputs object containing a map of node deformations
 */
export function solveDisplacement(
  stiffness: math.Matrix,
  force: number[],
  nnodes: number
): DeformOutputs {
  // Solve the system: stiffness * displacement = force
  const displacement = math.lusolve(stiffness, math.matrix(force));

  // Convert the solution to a flat array.
  // Assuming math.lusolve returns a 2D array (column vector) where each row has one number.
  const displacementArray = displacement.valueOf() as number[][];
  const flattenedDisplacements = displacementArray.map(row => row[0]);

  // Create a Map to store the deformation for each node.
  // In the new structure, each node’s deformation is a 6-tuple.
  const deformations = new Map<number, [number, number, number, number, number, number]>();

  const ndof = 3; // Active degrees of freedom per node (here, we compute only 3 values)

  for (let i = 0; i < nnodes; i++) {
    const dofStartIndex = i * ndof;
    
    // Build a 6-entry array for the node:
    // We insert two zeros at the beginning and one zero at the end,
    // placing the three computed displacement values in the middle.
    const deformationValues = [
      0,
      0,
      flattenedDisplacements[dofStartIndex] ?? 0,
      flattenedDisplacements[dofStartIndex + 1] ?? 0,
      flattenedDisplacements[dofStartIndex + 2] ?? 0,
      0,
    ] as [number, number, number, number, number, number];

    deformations.set(i, deformationValues);
  }

  // Create the DeformOutputs object.
  // Here, we assign the computed deformations and initialize reactions with an empty map.
  const deformOutputs: DeformOutputs = {
    deformations: deformations,
    reactions: new Map<number, [number, number, number, number, number, number]>()
  };

  return deformOutputs;
}
