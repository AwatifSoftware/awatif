// computeElementForce.test.ts

import { computeElementForce } from '../plates/computeElementForce';

describe('computeElementForce', () => {
  test('computes correct element force vector for uniform shape functions and pressure', () => {
    // Input parameters
    const nnel = 4; // Number of nodes per element (e.g., quadrilateral element)
    const shape = [0.25, 0.25, 0.25, 0.25]; // Uniform shape functions
    const P = -1; // Applied transverse pressure (negative indicates downward)

    // Expected output
    const expectedF = [
      -0.25, 0, 0,  // Node 0: w, θx, θy
      -0.25, 0, 0,  // Node 1: w, θx, θy
      -0.25, 0, 0,  // Node 2: w, θx, θy
      -0.25, 0, 0,  // Node 3: w, θx, θy
    ];

    // Call the function
    const f = computeElementForce(nnel, shape, P);

    // Assertion
    expect(f).toEqual(expectedF);
  });

  test('computes correct element force vector for varying shape functions and pressure', () => {
    // Input parameters
    const nnel = 4;
    const shape = [0.2, 0.3, 0.4, 0.1]; // Non-uniform shape functions
    const P = -2; // Applied transverse pressure

    // Expected output
    const expectedF = [
      -0.4, 0, 0,  // Node 0: w = 0.2 * -2 = -0.4
      -0.6, 0, 0,  // Node 1: w = 0.3 * -2 = -0.6
      -0.8, 0, 0,  // Node 2: w = 0.4 * -2 = -0.8
      -0.2, 0, 0,  // Node 3: w = 0.1 * -2 = -0.2
    ];

    // Call the function
    const f = computeElementForce(nnel, shape, P);

    // Assertion
    expect(f).toEqual(expectedF);
  });

  test('handles zero pressure correctly', () => {
    // Input parameters
    const nnel = 4;
    const shape = [0.25, 0.25, 0.25, 0.25];
    const P = 0; // Zero pressure

    // Expected output: All forces should be zero
    const expectedF = [
      0, 0, 0,  // Node 0
      0, 0, 0,  // Node 1
      0, 0, 0,  // Node 2
      0, 0, 0,  // Node 3
    ];

    // Call the function
    const f = computeElementForce(nnel, shape, P);

    // Assertion
    expect(f).toEqual(expectedF);
  });

 
});
