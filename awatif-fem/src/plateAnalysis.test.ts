import { calculateGlobalStiffnessMatrix } from './utils/plates/calculateGlobalStiffness';

import { meshRectangularPlate } from "./utils/plates/meshRectanglularPlate";
import { boundaryCondition } from "./utils/plates/boundaryCondition"; 
import { applyConstraints } from "./utils/plates/applyConstraints";
import { solveDisplacement } from "./utils/plates/solveDisplacement";


// Geometrical and material properties of plate
const a = 1; // Length along X-axis
const b = 1; // Breadth along Y-axis
const E = 10920; // Elastic modulus
const nu = 0.3; // Poisson's ratio
const t = 0.1; // Plate thickness
const Nx = 4;
const Ny = 4;

// Mock data for expected deformations
const expectedDeformations = new Map([
  [0, [0, 0, 0, 0, 0, 0]],
  [1, [0, 0, 0, -0.009578500565434793, 0, 0]],
  [2, [0, 0, 0, -0.013402374556582787, 0, 0]],
  [3, [0, 0, 0, -0.009578500565434668, 0, 0]],
  [4, [0, 0, 0, 0, 0, 0]],
  [5, [0, 0, 0, 0, -0.009578500565434656, 0]],
  [6, [0, 0, -0.0021585363311486735, -0.006499313893278511, -0.006499313893278464, 0]],
  [7, [0, 0, -0.003000712472570387, -0.009174753795408813, 0, 0]],
  [8, [0, 0, -0.0021585363311486688, -0.006499313893278535, 0.006499313893278498, 0]],
  [9, [0, 0, 0, 0, 0.00957850056543469, 0]],
  [10, [0, 0, 0, 0, -0.013402374556582889, 0]],
  [11, [0, 0, -0.0030007124725703886, 0, -0.009174753795408856, 0]],
  [12, [0, 0, -0.004207080506520302, 0, 0, 0]],
  [13, [0, 0, -0.003000712472570387, 0, 0.009174753795408832, 0]],
  [14, [0, 0, 0, 0, 0.01340237455658279, 0]],
  [15, [0, 0, 0, 0, -0.00957850056543467, 0]],
  [16, [0, 0, -0.0021585363311486714, 0.006499313893278499, -0.006499313893278498, 0]],
  [17, [0, 0, -0.0030007124725703878, 0.00917475379540884, 0, 0]],
  [18, [0, 0, -0.0021585363311486705, 0.006499313893278497, 0.00649931389327848, 0]],
  [19, [0, 0, 0, 0, 0.009578500565434689, 0]],
  [20, [0, 0, 0, 0, 0, 0]],
  [21, [0, 0, 0, 0.009578500565434689, 0, 0]],
  [22, [0, 0, 0, 0.013402374556582828, 0, 0]],
  [23, [0, 0, 0, 0.009578500565434685, 0, 0]],
  [24, [0, 0, 0, 0, 0, 0]],
]);

describe('Displacement calculation and verification', () => {
  it('should match the expected displacements', () => {
    // Generate mesh
    const { coordinates, elements, nel, nnode } = meshRectangularPlate(a, b, Nx, Ny);

    // Calculate the global stiffness matrix
    const result = calculateGlobalStiffnessMatrix(coordinates, elements, nel, nnode, E, nu, t);

    // Apply boundary conditions
    const typeBC = 'ss-ss-ss-ss'; // Simply supported boundary conditions
    const loadStep = 1;
    const constrainedDOFs = boundaryCondition(typeBC, coordinates, loadStep);

    // Apply constraints to the stiffness matrix and force vector
    applyConstraints(result.stiffness, result.force, constrainedDOFs);

    // Solve for displacements
    const displacement = solveDisplacement(result.stiffness, result.force, nnode);

    // Check if displacementMap is defined
    const displacementMap = displacement?.nodes;
    if (!displacementMap) {
      throw new Error("Displacement map is undefined. Check the output of solveDisplacement.");
    }

    // Compare calculated displacements to expected deformations
    for (let nodeIndex = 0; nodeIndex < expectedDeformations.size; nodeIndex++) {
      const expectedDeformation = expectedDeformations.get(nodeIndex);

      // Get the calculated deformation for the current node
      const calculatedDeformation = displacementMap.get(nodeIndex)?.deformation;

      // Ensure the deformation arrays have the same length
      expect(calculatedDeformation?.length).toBe(expectedDeformation?.length);

      // Compare each element of the deformation array with some tolerance
      calculatedDeformation?.forEach((value, index) => {
        expect(value).toBeCloseTo(expectedDeformation[index], 5); // 5 is the number of decimal places
      });
    }
  });
});
