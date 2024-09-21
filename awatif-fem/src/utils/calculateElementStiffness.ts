import { Node, QuadrilateralElement, PlateMaterialInput } from 'awatif-data-structure';
import { shapeFunctions } from './shapeFunctions';
import { computeJacobian } from './computeJacobian';
import { shapeFunctionDerivatives } from './shapeFunctionDerivatives';
import { plateBending } from './plateBending';
import { plateShear } from './plateShear';


/**
 * Calculates the element stiffness matrix ke for a quadrilateral element.
 *
 * @param elementNodes - QuadrilateralElement representing node indices of the element.
 * @param nodeCoordinates - Map of node indices to their coordinates [x, y, z].
 * @param material - PlateMaterialInput containing material properties.
 * @returns The element stiffness matrix ke as a 2D array.
 */
export function calculateElementStiffness(
  elementNodes: QuadrilateralElement,
  nodeCoordinates: Map<number, Node>,
  material: PlateMaterialInput
): number[][] {
  const nnel = 4; // Number of nodes per element (quadrilateral)
  const ndof = 3; // Degrees of freedom per node (w, thetax, thetay)
  const edof = nnel * ndof; // Total DOFs per element

  // Extract node coordinates
  const xx: number[] = [];
  const yy: number[] = [];
  for (let i = 0; i < nnel; i++) {
    const nodeIndex = elementNodes[i];
    const node = nodeCoordinates.get(nodeIndex);
    if (!node) {
      throw new Error(`Node with index ${nodeIndex} not found in nodeCoordinates.`);
    }
    xx[i] = node[0]; // x-coordinate
    yy[i] = node[1]; // y-coordinate
  }

  // Material properties
  const E = material.elasticity;
  const nu = material.poisson;
  const G = material.shearModulus; // Should be provided
  const t = material.thickness;
  const shcof = 5 / 6; // Shear correction factor

  // Material matrices
  const D_pb = multiplyScalarMatrix(
    [
      [1, nu, 0],
      [nu, 1, 0],
      [0, 0, (1 - nu) / 2],
    ],
    (E * t ** 3) / (12 * (1 - nu ** 2))
  );

  const D_ps = multiplyScalarMatrix(
    [
      [1, 0],
      [0, 1],
    ],
    G * t * shcof
  );

  // Initialize stiffness matrices
  let kb = createZeroMatrix(edof, edof); // Bending stiffness matrix
  let ks = createZeroMatrix(edof, edof); // Shear stiffness matrix

  // Gauss quadrature for bending (2x2)
  const gaussPointsBending = [
    [-1 / Math.sqrt(3), -1 / Math.sqrt(3)],
    [1 / Math.sqrt(3), -1 / Math.sqrt(3)],
    [1 / Math.sqrt(3), 1 / Math.sqrt(3)],
    [-1 / Math.sqrt(3), 1 / Math.sqrt(3)],
  ];
  const gaussWeightsBending = [1, 1, 1, 1];

  // Numerical integration for bending stiffness
  for (let int = 0; int < gaussPointsBending.length; int++) {
    const xi = gaussPointsBending[int][0];
    const eta = gaussPointsBending[int][1];
    const wt = gaussWeightsBending[int];

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

    // Kinematic matrix for bending
    const B_pb = plateBending(nnel, dshapedx, dshapedy);

    // Compute and accumulate kb
    const B_pb_T = transposeMatrix(B_pb);
    const kbIncrement = multiplyScalarMatrix(
      multiplyMatrices(multiplyMatrices(B_pb_T, D_pb), B_pb),
      wt * detjacobian
    );
    kb = addMatrices(kb, kbIncrement);
  }

  // Gauss quadrature for shear (1x1)
  const gaussPointsShear = [[0, 0]];
  const gaussWeightsShear = [4]; // Weight adjusted for 1-point quadrature

  // Numerical integration for shear stiffness
  for (let int = 0; int < gaussPointsShear.length; int++) {
    const xi = gaussPointsShear[int][0];
    const eta = gaussPointsShear[int][1];
    const wt = gaussWeightsShear[int];

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

    // Kinematic matrix for shear
    const B_ps = plateShear(nnel, dshapedx, dshapedy, shape);

    // Compute and accumulate ks
    const B_ps_T = transposeMatrix(B_ps);
    const ksIncrement = multiplyScalarMatrix(
      multiplyMatrices(multiplyMatrices(B_ps_T, D_ps), B_ps),
      wt * detjacobian
    );
    ks = addMatrices(ks, ksIncrement);
  }

  // Total element stiffness matrix
  const ke = addMatrices(kb, ks);

  return ke;
}




// Creates a zero matrix of size rows x cols
function createZeroMatrix(rows: number, cols: number): number[][] {
    return Array.from({ length: rows }, () => new Array(cols).fill(0));
  }
  
  // Adds two matrices
  function addMatrices(a: number[][], b: number[][]): number[][] {
    const rows = a.length;
    const cols = a[0].length;
    const result = createZeroMatrix(rows, cols);
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        result[i][j] = a[i][j] + b[i][j];
      }
    }
    return result;
  }
  
  // Multiplies two matrices
  function multiplyMatrices(a: number[][], b: number[][]): number[][] {
    const rowsA = a.length;
    const colsA = a[0].length;
    const colsB = b[0].length;
    const result = createZeroMatrix(rowsA, colsB);
    for (let i = 0; i < rowsA; i++) {
      for (let j = 0; j < colsB; j++) {
        let sum = 0;
        for (let k = 0; k < colsA; k++) {
          sum += a[i][k] * b[k][j];
        }
        result[i][j] = sum;
      }
    }
    return result;
  }
  
  // Multiplies a matrix by a scalar
  function multiplyScalarMatrix(matrix: number[][], scalar: number): number[][] {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const result = createZeroMatrix(rows, cols);
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        result[i][j] = matrix[i][j] * scalar;
      }
    }
    return result;
  }
  
  // Transposes a matrix
  function transposeMatrix(matrix: number[][]): number[][] {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const result = createZeroMatrix(cols, rows);
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        result[j][i] = matrix[i][j];
      }
    }
    return result;
  }
  