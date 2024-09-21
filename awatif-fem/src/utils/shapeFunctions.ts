
export interface ShapeFunctionResults {
    shape: number[];        // Shape functions [N1, N2, N3, N4]
    dshapedxi: number[];    // Derivatives of shape functions w.r.t xi [dN1/dxi, ..., dN4/dxi]
    dshapedeta: number[];   // Derivatives of shape functions w.r.t eta [dN1/deta, ..., dN4/deta]
  }

  export function shapeFunctions(xi: number, eta: number): ShapeFunctionResults {
    // Initialize arrays for shape functions and their derivatives
    const shape: number[] = [];
    const dshapedxi: number[] = [];
    const dshapedeta: number[] = [];
  
    // Compute shape functions
    shape[0] = 0.25 * (1 - xi) * (1 - eta); // N1
    shape[1] = 0.25 * (1 + xi) * (1 - eta); // N2
    shape[2] = 0.25 * (1 + xi) * (1 + eta); // N3
    shape[3] = 0.25 * (1 - xi) * (1 + eta); // N4
  
    // Compute derivatives of shape functions with respect to xi
    dshapedxi[0] = -0.25 * (1 - eta); // dN1/dxi
    dshapedxi[1] =  0.25 * (1 - eta); // dN2/dxi
    dshapedxi[2] =  0.25 * (1 + eta); // dN3/dxi
    dshapedxi[3] = -0.25 * (1 + eta); // dN4/dxi
  
    // Compute derivatives of shape functions with respect to eta
    dshapedeta[0] = -0.25 * (1 - xi); // dN1/deta
    dshapedeta[1] = -0.25 * (1 + xi); // dN2/deta
    dshapedeta[2] =  0.25 * (1 + xi); // dN3/deta
    dshapedeta[3] =  0.25 * (1 - xi); // dN4/deta
  
    return { shape, dshapedxi, dshapedeta };
  }