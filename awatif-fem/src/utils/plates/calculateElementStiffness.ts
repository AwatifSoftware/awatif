import { create, all, MathJsStatic } from 'mathjs';

// Initialize MathJS
const math: MathJsStatic = create(all);
import { Element } from 'awatif-data-structure';
import { GaussQuadratureResult, gaussQuadrature } from './gaussQuadrature';
import { shapeFunctions } from './shapeFunctions';
import { computeElementForce } from "./computeElementForce"


/**
 * Calculates the element stiffness matrix for a given element.
 *
 * @param nnel - Number of nodes per element.
 * @param edof - Degrees of freedom per element.
 * @param elementNodes - The indices of the nodes of the current element.
 * @param coordinates - The array of node coordinates for the entire mesh.
 * @param E - Elastic modulus.
 * @param nu - Poisson's ratio.
 * @param t - Plate thickness.
 * @returns The element stiffness matrix `ke`.
 */
export function calculateElementStiffness(
  nnel: number,
  edof: number,
  elementNodes: Element,
  coordinates: number[][],
  E: number,
  nu: number,
  t: number,
  P: number
):{ updatedF:  number[], ke: math.Matrix }  {
  // Shear modulus
  const G = E / (2 * (1 + nu));

  // Shear correction factor
  const shcof = 5 / 6;

  // Material matrices (without thickness factors)
  const D_pb = math.multiply(
    E / (1 - nu ** 2),
    math.matrix([
      [1, nu, 0],
      [nu, 1, 0],
      [0, 0, (1 - nu) / 2],
    ])
  ) as math.Matrix;

  const D_ps = math.multiply(G * shcof, math.identity(2)) as math.Matrix;

  // Gauss quadrature for bending
  const resultBending: GaussQuadratureResult = gaussQuadrature('second');

  // Gauss quadrature for shear
  const resultShear: GaussQuadratureResult = gaussQuadrature('first');

  // Extract node coordinates for the current element
  const xx: number[] = [];
  const yy: number[] = [];
  for (let i = 0; i < nnel; i++) {
    const nodeIndex = elementNodes[i];
    const node = coordinates[nodeIndex];
    xx[i] = node[0]; // x-coordinate
    yy[i] = node[1]; // y-coordinate
  }

  // Initialize element matrices
  let kb = math.zeros(edof, edof) as math.Matrix; // Bending stiffness matrix
  let ks = math.zeros(edof, edof) as math.Matrix; // Shear stiffness matrix
  let f = math.zeros([edof, 1]) as math.Matrix;  //  Force vector

  // Numerical integration for bending stiffness
  for (let int = 0; int < resultBending.gaussPoints.length; int++) {
    const xi = resultBending.gaussPoints[int][0];
    const eta = resultBending.gaussPoints[int][1];
    const wt = resultBending.gaussWeights[int];

    // Shape functions and derivatives
    const { dshapedxi, dshapedeta } = shapeFunctions(xi, eta);

    // Jacobian and inverse
    const { detjacobian, invjacobian } = computeJacobian(
      nnel,
      dshapedxi,
      dshapedeta,
      xx,
      yy
    );

    // Derivatives w.r.t physical coordinates
    const { dshapedx, dshapedy } = shapeFunctionDerivatives(
      nnel,
      dshapedxi,
      dshapedeta,
      invjacobian
    );

    // Kinematic matrix for bending
    const B_pb = plateBending(nnel, dshapedx, dshapedy);

    // Compute and accumulate kb (include thickness factor t^3 / 12)
    const B_pb_T = math.transpose(B_pb);
    const stiffnessMatrix = math.multiply(
      math.multiply(B_pb_T, D_pb),
      B_pb
    ) as math.Matrix;
    const kbIncrement = math.multiply(
      stiffnessMatrix,
      (t ** 3 / 12) * wt * detjacobian
    ) as math.Matrix;

    kb = math.add(kb, kbIncrement) as math.Matrix;
  }

  // Numerical integration for shear stiffness
  for (let int = 0; int < resultShear.gaussPoints.length; int++) {
    const xi = resultShear.gaussPoints[int][0];
    const eta = resultShear.gaussPoints[int][1];
    const wt = resultShear.gaussWeights[int];


    // Shape functions and derivatives
    const { shape, dshapedxi, dshapedeta } = shapeFunctions(xi, eta);

    // Jacobian and inverse
    const { detjacobian, invjacobian } = computeJacobian(
      nnel,
      dshapedxi,
      dshapedeta,
      xx,
      yy
    );

    // Derivatives w.r.t physical coordinates
    const { dshapedx, dshapedy } = shapeFunctionDerivatives(
      nnel,
      dshapedxi,
      dshapedeta,
      invjacobian
    );

    // Kinematic matrix for shear (use 'shape' instead of 'dshapedxi')
    const B_ps = plateShear(nnel, dshapedx, dshapedy, shape);

    // Compute and accumulate ks (include thickness factor t)
    const B_ps_T = math.transpose(B_ps);
    const stiffnessMatrix = math.multiply(
      math.multiply(B_ps_T, D_ps),
      B_ps
    ) as math.Matrix;
    const ksIncrement = math.multiply(
      stiffnessMatrix,
      t * wt * detjacobian
    ) as math.Matrix;

    ks = math.add(ks, ksIncrement) as math.Matrix;

    let fe = computeElementForce(nnel,shape,P) ;             
    
            
    const scaleFactor = wt * detjacobian; // Calculate the scalar multiplication factor
    const scaledFe = math.multiply(fe, scaleFactor); // Scale fe by the factor
    f = math.add(f, scaledFe); // Accumulate force vector
  }

  // Total element stiffness matrix
  const ke = math.add(kb, ks) as math.Matrix;

  // Extract values from the matrix and map to an array
  // Extract the values manually


// Convert the matrix to a regular array
let fArray: number[] = (f.valueOf() as number[][]).map(row => row[0]);

  return { updatedF: fArray, ke };
}






function computeJacobian(
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


function plateBending(
  nnel: number,
  dshapedx: number[],
  dshapedy: number[]
): number[][] {
  // Initialize pb as a 3 x (nnel * 3) matrix filled with zeros
  const numRows = 3;
  const numCols = nnel * 3;
  const pb: number[][] = Array.from({ length: numRows }, () =>
    new Array(numCols).fill(0)
  );

  // Loop over each node
  for (let i = 0; i < nnel; i++) {
    const i1 = i * 3;
    const i2 = i1 + 1;
    const i3 = i1 + 2;

    pb[0][i2] = -dshapedx[i];
    pb[1][i3] = -dshapedy[i];
    pb[2][i2] = -dshapedy[i];
    pb[2][i3] = -dshapedx[i];
    pb[2][i1] = 0;
  }

  return pb;
}



function plateShear(
  nnel: number,
  dshapedx: number[],
  dshapedy: number[],
  shape: number[]
): number[][] {
  // Initialize ps as a 2 x (nnel * 3) matrix filled with zeros
  const numRows = 2;
  const numCols = nnel * 3;
  const ps: number[][] = Array.from({ length: numRows }, () =>
    new Array(numCols).fill(0)
  );

  // Loop over each node
  for (let i = 0; i < nnel; i++) {
    const i1 = i * 3;
    const i2 = i1 + 1;
    const i3 = i1 + 2;

    ps[0][i1] = dshapedx[i];
    ps[1][i1] = dshapedy[i];
    ps[0][i2] = -shape[i];
    ps[1][i3] = -shape[i];
  }

  return ps;
}


function shapeFunctionDerivatives(
  nnel: number,
  dshapedxi: number[],
  dshapedeta: number[],
  invjacob: number[][]
): { dshapedx: number[]; dshapedy: number[] } {
  // Initialize arrays for derivatives
  const dshapedx: number[] = new Array(nnel);
  const dshapedy: number[] = new Array(nnel);

  // Compute derivatives for each node
  for (let i = 0; i < nnel; i++) {
    dshapedx[i] = invjacob[0][0] * dshapedxi[i] + invjacob[0][1] * dshapedeta[i];
    dshapedy[i] = invjacob[1][0] * dshapedxi[i] + invjacob[1][1] * dshapedeta[i];
  }

  return { dshapedx, dshapedy };
}
