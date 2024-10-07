import { create, all, MathJsStatic } from 'mathjs';

// Initialize MathJS
const math: MathJsStatic = create(all);

/**
 * Applies boundary conditions by modifying the stiffness matrix and force vector in place.
 *
 * @param kk - The global stiffness matrix as a MathJS matrix.
 * @param ff - The global force vector as a number[].
 * @param bcdof - The array of constrained DOF indices.
 */
export function applyConstraints(
  kk: math.Matrix,
  ff: number[],
  bcdof: number[]
): void {
  const sdof = kk.size()[0]; // Number of DOFs in the system (assumes square matrix)

  // Apply constraints
  for (const c of bcdof) {
    // Zero out the c-th row and c-th column in kk
    for (let j = 0; j < sdof; j++) {
      kk.set([c, j], 0); // Zero out row c
      kk.set([j, c], 0); // Zero out column c
    }

    kk.set([c, c], 1);   // Set the diagonal element to 1
    ff[c] = 0;           // Set the corresponding force to 0
  }
}
