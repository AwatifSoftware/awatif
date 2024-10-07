export function assemble(
  globalK: number[][], // Global stiffness matrix
  globalF: number[],   // Global force vector
  ke: number[][],      // Element stiffness matrix
  fe: number[],        // Element force vector
  index: number[]      // DOF vector associated with the element
): void {
  const edof = index.length; // Number of DOFs per element

  // Assemble the element stiffness matrix and force vector into the global system
  for (let i = 0; i < edof; i++) {
    const globalI = index[i]; // Global DOF corresponding to local DOF i

    // Update the global force vector
    globalF[globalI] += fe[i];

    for (let j = 0; j < edof; j++) {
      const globalJ = index[j]; // Global DOF corresponding to local DOF j

      // Update the global stiffness matrix
      globalK[globalI][globalJ] += ke[i][j];
    }
  }
}
