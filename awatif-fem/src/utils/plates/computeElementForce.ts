
export function computeElementForce(nnel: number, shape: number[], P: number): number[] {
    // Compute nodal forces: multiply shape functions by pressure
    const fef = shape.map(N => N * P); // fef is an array of nodal forces for w DOF
  
    // Initialize the element force vector with zeros
    const edof = nnel * 3; // Total DOFs per element (w, θx, θy per node)
    const f: number[] = new Array(edof).fill(0);
  
    // Assemble the element force vector
    for (let i = 0; i < nnel; i++) {
      const i1 = i * 3;     // Index for w DOF at node i
      const i2 = i1 + 1;    // Index for θx DOF at node i
      const i3 = i1 + 2;    // Index for θy DOF at node i
  
      f[i1] = fef[i];       // Assign nodal force to w DOF
      f[i2] = 0;            // θx DOF receives zero force
      f[i3] = 0;            // θy DOF receives zero force
    }
  
    return f;
  }
  