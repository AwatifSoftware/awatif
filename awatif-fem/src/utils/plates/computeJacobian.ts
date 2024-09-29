/**
 * Computes the Jacobian matrix, its determinant, and its inverse for 2D mapping.
 *
 * @param nnel - Number of nodes per element
 * @param dshapedxi - Derivatives of shape functions w.r.t xi
 * @param dshapedeta - Derivatives of shape functions w.r.t eta
 * @param xcoord - x-coordinate values of nodes
 * @param ycoord - y-coordinate values of nodes
 * @returns An object containing the determinant and inverse of the Jacobian matrix
 */
export function computeJacobian(
    nnel: number,
    dshapedxi: number[],
    dshapedeta: number[],
    xcoord: number[],
    ycoord: number[]
  ): { detjacobian: number; invjacobian: number[][] } {
    // Initialize the Jacobian matrix
    const jacobianMatrix: number[][] = [
      [0, 0],
      [0, 0],
    ];
  
    // Assemble the Jacobian matrix
    for (let i = 0; i < nnel; i++) {
      jacobianMatrix[0][0] += dshapedxi[i] * xcoord[i];
      jacobianMatrix[0][1] += dshapedxi[i] * ycoord[i];
      jacobianMatrix[1][0] += dshapedeta[i] * xcoord[i];
      jacobianMatrix[1][1] += dshapedeta[i] * ycoord[i];
    }
  
    // Compute the determinant of the Jacobian matrix
    const detjacobian =
      jacobianMatrix[0][0] * jacobianMatrix[1][1] -
      jacobianMatrix[0][1] * jacobianMatrix[1][0];
  
    // Check for singularity
    if (Math.abs(detjacobian) < Number.EPSILON) {
      throw new Error(
        'Jacobian determinant is zero or near zero. Inverse cannot be computed.'
      );
    }
  
    // Compute the inverse of the Jacobian matrix
    const invdet = 1 / detjacobian;
  
    const invjacobian: number[][] = [
      [jacobianMatrix[1][1] * invdet, -jacobianMatrix[0][1] * invdet],
      [-jacobianMatrix[1][0] * invdet, jacobianMatrix[0][0] * invdet],
    ];
  
    return { detjacobian, invjacobian };
  }
  