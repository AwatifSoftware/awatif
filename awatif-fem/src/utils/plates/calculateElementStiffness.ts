import { create, all, MathJsStatic } from 'mathjs';

// Initialize MathJS
const math: MathJsStatic = create(all);

import { Element } from 'awatif-data-structure';
import { GaussQuadratureResult, gaussQuadrature } from './gaussQuadrature';
import { shapeFunctions } from './shapeFunctions';
import { computeJacobian } from './computeJacobian';
import { shapeFunctionDerivatives } from './shapeFunctionDerivatives';
import { plateBending } from './plateBending';
import { plateShear } from './plateShear';
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
