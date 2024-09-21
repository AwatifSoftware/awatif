
export function applyConstraints(
    kk: number[][],
    ff: number[],
    bcdof: number[]
  ): void {
    // Input validation
    if (!kk || !ff || !bcdof) {
      throw new Error('Invalid inputs: kk, ff, and bcdof must be defined.');
    }
  
    const sdof = kk.length; // Number of DOFs in the system
  
    if (kk.length !== sdof || ff.length !== sdof) {
      throw new Error('The size of kk and ff must be consistent.');
    }
  
    // Validate bcdof indices
    for (const c of bcdof) {
      if (c < 0 || c >= sdof) {
        throw new Error(`Constrained DOF index ${c} is out of bounds.`);
      }
    }
  
    // Apply constraints
    for (const c of bcdof) {
      // Zero out the c-th row and c-th column in kk
      for (let j = 0; j < sdof; j++) {
        kk[c][j] = 0; // Zero out row c
        kk[j][c] = 0; // Zero out column c
      }
  
      kk[c][c] = 1;   // Set the diagonal element to 1
      ff[c] = 0;      // Set the corresponding force to 0
    }
  }
  