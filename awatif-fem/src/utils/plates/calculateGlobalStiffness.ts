import { create, all, MathJsStatic } from 'mathjs';

// Initialize MathJS
const math: MathJsStatic = create(all);

import { QuadrilateralElement } from 'awatif-data-structure';

// Import helper functions
import { meshRectangularPlate } from './meshRectanglularPlate';
import { elementDOF } from './elementDOF';
import { assemble } from './assemble2D';

// Import the calculateElementStiffness function
import { calculateElementStiffness } from './calculateElementStiffness';

/**
 * Calculates the global stiffness matrix and force vector for a given mesh and element properties.
 *
 * @param coordinates - The array of node coordinates for the entire mesh.
 * @param elements - The array of elements, where each element contains the indices of its nodes.
 * @param nel - The number of elements in the mesh.
 * @param nnode - The total number of nodes in the mesh.
 * @param E - Elastic modulus of the material.
 * @param nu - Poisson's ratio of the material.
 * @param t - Thickness of the plate.
 * @returns An object containing the global stiffness matrix and force vector.
 */
export function calculateGlobalStiffnessMatrix(
  coordinates: number[][],
  elements: QuadrilateralElement[],
  nel: number,
  nnode: number,
  E: number,
  nu: number,
  t: number
): { stiffness: math.Matrix, force: number[] } {
  // Geometrical and material properties are passed as parameters.

  // Shear modulus (G) is derived from elastic modulus and Poisson's ratio.
  const G = 0.5 * E / (1 + nu);

  const nnel = 4; // Number of nodes per element (quadrilateral)
  
  // Degrees of freedom per node and total system DOFs
  const ndof = 3; // Degrees of freedom per node (w, thetax, thetay)
  const sdof = nnode * ndof; // Total system DOFs
  const edof = nnel * ndof;  // Degrees of freedom per element
  console.log(sdof);

  // Initialize global stiffness matrix and force vector
  let stiffness = math.zeros(sdof, sdof) as math.Matrix;
  let force: number[] = new Array(sdof).fill(0); // Initialize global force array

  // Loop over all elements
  for (let iel = 0; iel < nel; iel++) {
    // Extract node indices for the current element
    const elementNodes: QuadrilateralElement = elements[iel];

    // Calculate element stiffness matrix and force vector
    let { updatedF: f, ke } = calculateElementStiffness(
      nnel,
      edof,
      elementNodes,
      coordinates,
      E,
      nu,
      t
    );

    // Map local DOFs to global DOFs using elementDOF
    const index = elementDOF(elementNodes, ndof);

    // Convert stiffness and element stiffness matrix to arrays for assembly
    let stiffnessArray = stiffness.toArray() as number[][]; // Convert math.Matrix to number[][]
    let keArray = ke.toArray() as number[][]; // Convert ke from math.Matrix to number[][]

    // Assemble the global stiffness matrix and force vector
    assemble(stiffnessArray, force, keArray, f, index);

    // Convert the assembled stiffnessArray back to math.Matrix after modification
    stiffness = math.matrix(stiffnessArray);
  }

  // Return both the global stiffness matrix and the force vector
  return { stiffness, force };
}
