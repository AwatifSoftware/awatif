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
 * Calculates the global stiffness matrix for the Mindlin plate bending problem.
 */
export function calculateGlobalStiffnessMatrix(): math.Matrix {
  // Geometrical and material properties of plate
  const a = 2; // Length along X-axis
  const b = 2; // Breadth along Y-axis
  const E = 10920; // Elastic modulus
  const nu = 0.3;  // Poisson's ratio
  const t = 0.1;   // Plate thickness

  // Shear modulus
  const G = 0.5 * E / (1 + nu);

  // Number of mesh elements in x and y directions
  const Nx = 2;
  const Ny = 2;

  // Generate mesh
  const { coordinates, elements, nel, nnode } = meshRectangularPlate(a, b, Nx, Ny);

  // Number of nodes per element and degrees of freedom
  const nnel = 4; // Quadrilateral element
  const ndof = 3; // Degrees of freedom per node (w, thetax, thetay)
  const sdof = nnode * ndof; // Total system DOFs
  const edof = nnel * ndof;  // Degrees of freedom per element

  // Initialize global stiffness matrix
  let stiffness = math.zeros(sdof, sdof) as math.Matrix;

  // Loop over elements
  for (let iel = 0; iel < nel; iel++) {
    // Extract node indices for the current element
    const elementNodes: QuadrilateralElement = elements[iel];

    // Calculate element stiffness matrix
    const ke = calculateElementStiffness(
      nnel,
      edof,
      elementNodes,
      coordinates,
      E,
      nu,
      t,
      G
    );

    // Map local DOFs to global DOFs using elementDOF
    const index = elementDOF(elementNodes, ndof);

    // Assemble stiffness matrix
    let stiffnessArray = stiffness.toArray() as number[][]; // Convert math.Matrix to number[][]
    let keArray = ke.toArray() as number[][]; // Convert ke from math.Matrix to number[][]

    assemble(stiffnessArray, keArray, index);

    // Convert the assembled stiffnessArray back to math.Matrix after modification
    stiffness = math.matrix(stiffnessArray);
  }

  // Return the global stiffness matrix
  return stiffness;
}
