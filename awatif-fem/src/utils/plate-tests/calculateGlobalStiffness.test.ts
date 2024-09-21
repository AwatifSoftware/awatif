import { create, all, MathJsStatic } from 'mathjs';
import { calculateGlobalStiffnessMatrix } from '../calculateGlobalStiffness';

// Initialize MathJS
const math: MathJsStatic = create(all);

describe('calculateGlobalStiffnessMatrix', () => {
  it('should return a global stiffness matrix with correct dimensions', () => {
    // Call the function to calculate the global stiffness matrix
    const stiffnessMatrix = calculateGlobalStiffnessMatrix();

    console.log(stiffnessMatrix);

    // The problem is for a rectangular plate with 2x2 elements and 4 nodes per element.
    // Each node has 3 degrees of freedom (w, thetax, thetay), so the global stiffness matrix
    // should have a size of (12, 12) for 4 nodes * 3 DOF = 12 DOF.
    const expectedSize = 27;

    // Check the dimensions of the global stiffness matrix (whether it's a math.Matrix or an array)
    const stiffnessMatrixArray = Array.isArray(stiffnessMatrix)
      ? stiffnessMatrix
      : stiffnessMatrix.toArray();

    expect(stiffnessMatrixArray.length).toBe(expectedSize);
    expect(stiffnessMatrixArray[0].length).toBe(expectedSize);

    // Verify the matrix is not empty
    expect(stiffnessMatrixArray.flat().reduce((a, b) => a + b, 0)).not.toBe(0);
  });

});
