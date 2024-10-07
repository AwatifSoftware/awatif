import { Matrix, zeros, subset, index } from 'mathjs';

export function computeElementForce(nnel: number, shape: number[], P: number): Matrix {
    // Compute nodal forces: multiply shape functions by pressure
    const fef = shape.map(N => N * P); // fef is an array of nodal forces for w DOF
  
    // Initialize the element force vector as a column vector (edof x 1)
    const edof = nnel * 3; // Total DOFs per element (w, θx, θy per node)
    let f = zeros([edof, 1]) as Matrix; // Initialize as a math.js matrix
  
    // Assemble the element force vector
    for (let i = 0; i < nnel; i++) {
      const i1 = i * 3;     // Index for w DOF at node i
      const i2 = i1 + 1;    // Index for θx DOF at node i
      const i3 = i1 + 2;    // Index for θy DOF at node i
  
      // Use `math.subset` to assign values to the matrix `f`
      f = subset(f, index(i1, 0), fef[i]); // Assign nodal force to w DOF
      f = subset(f, index(i2, 0), 0);      // θx DOF receives zero force
      f = subset(f, index(i3, 0), 0);      // θy DOF receives zero force
    }
  
    return f; // Returning the column vector as a math.js matrix
}
