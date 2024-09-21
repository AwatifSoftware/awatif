export function assemble(
    globalK: number[][],
 
    ke: number[][],
  
    index: number[]
  ): void {
    const edof = index.length; // Number of DOFs per element
  
    // Assemble the element stiffness matrix into the global stiffness matrix
    for (let i = 0; i < edof; i++) {
      const globalI = index[i]; // Global DOF corresponding to local DOF i
  
    
  
      for (let j = 0; j < edof; j++) {
        const globalJ = index[j]; // Global DOF corresponding to local DOF j
  
        // Update the global stiffness matrix
        globalK[globalI][globalJ] += ke[i][j];
      }
    }
  }