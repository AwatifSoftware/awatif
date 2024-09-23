import { create, all, MathJsStatic } from 'mathjs';

// Initialize MathJS
const math: MathJsStatic = create(all);

import { QuadrilateralElement } from 'awatif-data-structure';
import { GaussQuadratureResult, gaussQuadrature } from './gaussQuadrature';
import { shapeFunctions } from './shapeFunctions';
import { computeJacobian } from './computeJacobian';
import { shapeFunctionDerivatives } from './shapeFunctionDerivatives';
import { plateBending } from './plateBending';
import { plateShear } from './plateShear';

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
 * @param G - Shear modulus.
 * @returns The element stiffness matrix `ke`.
 */
export function calculateElementStiffness(
  nnel: number,
  edof: number,
  elementNodes: QuadrilateralElement,
  coordinates: number[][],
  E: number,
  nu: number,
  t: number,
  G: number
): math.Matrix {
  // Shear correction factor
  const shcof = 5 / 6;

  // Material matrices
  const D_pb = math.multiply(
    (E * t ** 3) / (12 * (1 - nu ** 2)),
    math.matrix([
      [1, nu, 0],
      [nu, 1, 0],
      [0, 0, (1 - nu) / 2],
    ])
  ) as math.Matrix;

  const D_ps = math.multiply(G * t * shcof, math.identity(2)) as math.Matrix;

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

    // Compute and accumulate kb
    const B_pb_T = math.transpose(B_pb);
    const kbIncrement = math.multiply(
      math.multiply(math.multiply(B_pb_T, D_pb), B_pb),
      wt * detjacobian
    ) as math.Matrix;
    kb = math.add(kb, kbIncrement) as math.Matrix;
  }

  // Numerical integration for shear stiffness
  for (let int = 0; int < resultShear.gaussPoints.length; int++) {
    const xi = resultShear.gaussPoints[int][0];
    const eta = resultShear.gaussPoints[int][1];
    const wt = resultShear.gaussWeights[int];

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

    // Kinematic matrix for shear
    const B_ps = plateShear(nnel, dshapedx, dshapedy, dshapedxi);

    // Compute and accumulate ks
    const B_ps_T = math.transpose(B_ps);
    const ksIncrement = math.multiply(
      math.multiply(math.multiply(B_ps_T, D_ps), B_ps),
      wt * detjacobian
    ) as math.Matrix;
    ks = math.add(ks, ksIncrement) as math.Matrix;
  }

  // Total element stiffness matrix
  const ke = math.add(kb, ks) as math.Matrix;

  return ke;
}
