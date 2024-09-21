import { create, all, MathJsStatic } from 'mathjs';

// Initialize MathJS
const math: MathJsStatic = create(all);

import {
    Node,
    QuadrilateralElement,
    PlateMaterialInput,
  } from 'awatif-data-structure';
  
  // Import helper functions
  import { meshRectangularPlate } from './meshRectanglularPlate';
  import { gaussQuadrature, GaussQuadratureResult } from './gaussQuadrature';
  import { shapeFunctions } from './shapeFunctions';
  import { computeJacobian } from './computeJacobian';
  import { shapeFunctionDerivatives } from './shapeFunctionDerivatives';
  import { plateBending } from './plateBending';
  import { plateShear } from './plateShear';
  import { elementDOF } from './elementDOF';
  import { assemble } from './assemble2D';


  /**
 * Calculates the global stiffness matrix for the Mindlin plate bending problem.
 */
export function calculateGlobalStiffnessMatrix(): math.Matrix {
    // Geometrical and material properties of plate
    const a = 2; // Length along X-axis
    const b = 2; // Breadth along Y-axis
    const E = 10920; // Elastic modulus
    const nu = 0.3;  // Poisson's ratio
    const t = 0.1;   // Plate thickness
  
    // Shear modulus
    const G = 0.5 * E / (1 + nu);
  
    // Plate material input
    const material: PlateMaterialInput = {
      elasticity: E,
      poisson: nu,
      shearModulus: G,
      thickness: t,
    };
  
    // Number of mesh elements in x and y directions
    const Nx = 2;
    const Ny = 2;
  
    // Generate mesh
    const { coordinates, elements, nel, nnode } = meshRectangularPlate(a, b, Nx, Ny);
  

  
    // Number of nodes per element and degrees of freedom
    const nnel = 4; // Quadrilateral element
    const ndof = 3; // Degrees of freedom per node (w, thetax, thetay)
    const sdof = nnode * ndof; // Total system DOFs
    const edof = nnel * ndof;  // Degrees of freedom per element
  
    // Initialize global stiffness matrix
    let stiffness = math.zeros(sdof, sdof) as math.Matrix;
  
    // Material matrices
    const D_pb = math.multiply(
      (E * t ** 3) / (12 * (1 - nu ** 2)),
      math.matrix([
        [1, nu, 0],
        [nu, 1, 0],
        [0, 0, (1 - nu) / 2],
      ])
    ) as math.Matrix;
  
    const shcof = 5 / 6; // Shear correction factor
    const D_ps = math.multiply(
      G * t * shcof,
      math.identity(2)
    ) as math.Matrix;
  
    // Gauss quadrature for bending
   
    const resultBending: GaussQuadratureResult = gaussQuadrature('second');

  
    // Gauss quadrature for shear
    const resultShear: GaussQuadratureResult = gaussQuadrature('first');
  
    // Loop over elements
    for (let iel = 0; iel < nel; iel++) {
      // Extract node indices for the current element
      const elementNodes: QuadrilateralElement = elements[iel];
  
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
        const { shape, dshapedxi, dshapedeta } = shapeFunctions(xi, eta);
  
        // Jacobian and inverse
        const { detjacobian, invjacobian } = computeJacobian(nnel, dshapedxi, dshapedeta, xx, yy);
  
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
        const { shape, dshapedxi, dshapedeta } = shapeFunctions(xi, eta);
  
        // Jacobian and inverse
        const { detjacobian, invjacobian } = computeJacobian(nnel, dshapedxi, dshapedeta, xx, yy);
  
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
        const B_ps_T = math.transpose(B_ps);
        const ksIncrement = math.multiply(
          math.multiply(math.multiply(B_ps_T, D_ps), B_ps),
          wt * detjacobian
        ) as math.Matrix;
        ks = math.add(ks, ksIncrement) as math.Matrix;
      }
  
      // Total element stiffness matrix
      const ke = math.add(kb, ks) as math.Matrix;
  
      // Map local DOFs to global DOFs using elementDOF
      const index = elementDOF(elementNodes, ndof);
  
      // Before calling the assemble function
        let stiffnessArray = stiffness.toArray() as number[][]; // Convert math.Matrix to number[][]
        let keArray = ke.toArray() as number[][]; // Convert ke from math.Matrix to number[][]

        // Call the assemble function with converted arrays
        assemble(stiffnessArray, keArray, index);

        // Convert the assembled stiffnessArray back to math.Matrix after modification
        stiffness = math.matrix(stiffnessArray);






    }
  
    // Return the global stiffness matrix
    return stiffness;
  }
  