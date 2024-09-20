// tests/shapeFunctions.test.ts

import { shapeFunctions } from '../shapeFunctions';
import { ShapeFunctionResults } from '../shapeFunctions';

describe('shapeFunctions', () => {
    /**
     * Helper function to compare arrays with a tolerance to account for floating-point precision.
     *
     * @param received - The array received from the function.
     * @param expected - The array expected as the correct result.
     * @param precision - Number of decimal places to consider for comparison.
     */
    const arraysAreClose = (received: number[], expected: number[], precision: number = 10): boolean => {
        if (received.length !== expected.length) return false;
        for (let i = 0; i < received.length; i++) {
            if (Math.abs(received[i] - expected[i]) > Number.EPSILON * Math.pow(10, precision)) {
                return false;
            }
        }
        return true;
    };

    it('should correctly compute shape functions and their derivatives at the center of the element (xi=0, eta=0)', () => {
        const xi = 0;
        const eta = 0;
        const result: ShapeFunctionResults = shapeFunctions(xi, eta);

        const expectedShape: [number, number, number, number] = [0.25, 0.25, 0.25, 0.25];
        const expectedDshapedxi: [number, number, number, number] = [-0.25, 0.25, 0.25, -0.25];
        const expectedDshapedeta: [number, number, number, number] = [-0.25, -0.25, 0.25, 0.25];

        expect(arraysAreClose(result.shape, expectedShape)).toBe(true);
        expect(arraysAreClose(result.dshapedxi, expectedDshapedxi)).toBe(true);
        expect(arraysAreClose(result.dshapedeta, expectedDshapedeta)).toBe(true);
    });

    it('should correctly compute shape functions and their derivatives at node 1 (xi=-1, eta=-1)', () => {
        const xi = -1;
        const eta = -1;
        const result: ShapeFunctionResults = shapeFunctions(xi, eta);

        const expectedShape: [number, number, number, number] = [1, 0, 0, 0];
        const expectedDshapedxi: [number, number, number, number] = [-0.5, 0.5, 0.0, -0.0];
        const expectedDshapedeta: [number, number, number, number] = [-0.5, -0.0, 0.0, 0.5];

        expect(arraysAreClose(result.shape, expectedShape)).toBe(true);
        expect(arraysAreClose(result.dshapedxi, expectedDshapedxi)).toBe(true);
        expect(arraysAreClose(result.dshapedeta, expectedDshapedeta)).toBe(true);
    });

    it('should correctly compute shape functions and their derivatives at node 2 (xi=1, eta=-1)', () => {
        const xi = 1;
        const eta = -1;
        const result: ShapeFunctionResults = shapeFunctions(xi, eta);

        const expectedShape: [number, number, number, number] = [0.0, 1.0, 0.0, 0.0];
        const expectedDshapedxi: [number, number, number, number] = [-0.5, 0.5, 0.0, -0.0];
        const expectedDshapedeta: [number, number, number, number] = [-0.0, -0.5, 0.5, 0.0];

        expect(arraysAreClose(result.shape, expectedShape)).toBe(true);
        expect(arraysAreClose(result.dshapedxi, expectedDshapedxi)).toBe(true);
        expect(arraysAreClose(result.dshapedeta, expectedDshapedeta)).toBe(true);
    });

    it('should correctly compute shape functions and their derivatives at node 3 (xi=1, eta=1)', () => {
        const xi = 1;
        const eta = 1;
        const result: ShapeFunctionResults = shapeFunctions(xi, eta);

        const expectedShape: [number, number, number, number] = [0.0, 0.0, 1.0, 0.0];
        const expectedDshapedxi: [number, number, number, number] = [-0.0, 0.0, 0.5, -0.5];
        const expectedDshapedeta: [number, number, number, number] = [-0.0, -0.5, 0.5, 0.0];

        expect(arraysAreClose(result.shape, expectedShape)).toBe(true);
        expect(arraysAreClose(result.dshapedxi, expectedDshapedxi)).toBe(true);
        expect(arraysAreClose(result.dshapedeta, expectedDshapedeta)).toBe(true);
    });

    it('should correctly compute shape functions and their derivatives at node 4 (xi=-1, eta=1)', () => {
        const xi = -1;
        const eta = 1;
        const result: ShapeFunctionResults = shapeFunctions(xi, eta);

        const expectedShape: [number, number, number, number] = [0.0, 0.0, 0.0, 1.0];
        const expectedDshapedxi: [number, number, number, number] = [-0.0, 0.0, 0.5, -0.5];
        const expectedDshapedeta: [number, number, number, number] = [-0.5, -0.0, 0.0, 0.5];

        expect(arraysAreClose(result.shape, expectedShape)).toBe(true);
        expect(arraysAreClose(result.dshapedxi, expectedDshapedxi)).toBe(true);
        expect(arraysAreClose(result.dshapedeta, expectedDshapedeta)).toBe(true);
    });

    it('should correctly compute shape functions and their derivatives at midpoint (xi=0, eta=-1)', () => {
        const xi = 0;
        const eta = -1;
        const result: ShapeFunctionResults = shapeFunctions(xi, eta);

        const expectedShape: [number, number, number, number] = [0.5, 0.5, 0.0, 0.0];
        const expectedDshapedxi: [number, number, number, number] = [-0.5, 0.5, 0.0, -0.0];
        const expectedDshapedeta: [number, number, number, number] = [-0.25, -0.25, 0.25, 0.25];
        
        // Due to floating point arithmetic, using toBeCloseTo with precision
        expect(arraysAreClose(result.shape, expectedShape)).toBe(true);
        expect(arraysAreClose(result.dshapedxi, expectedDshapedxi)).toBe(true);
        expect(arraysAreClose(result.dshapedeta, expectedDshapedeta)).toBe(true);
    });

    it('should correctly compute shape functions and their derivatives at arbitrary point (xi=0.5, eta=0.5)', () => {
        const xi = 0.5;
        const eta = 0.5;
        const result: ShapeFunctionResults = shapeFunctions(xi, eta);

        const expectedShape: [number, number, number, number] = [
            0.25 * (1 - 0.5) * (1 - 0.5), // N1 = 0.25 * 0.5 * 0.5 = 0.0625
            0.25 * (1 + 0.5) * (1 - 0.5), // N2 = 0.25 * 1.5 * 0.5 = 0.1875
            0.25 * (1 + 0.5) * (1 + 0.5), // N3 = 0.25 * 1.5 * 1.5 = 0.5625
            0.25 * (1 - 0.5) * (1 + 0.5)  // N4 = 0.25 * 0.5 * 1.5 = 0.1875
        ];

        const expectedDshapedxi: [number, number, number, number] = [
            -0.25 * (1 - 0.5), // dN1/dxi = -0.25 * 0.5 = -0.125
             0.25 * (1 - 0.5), // dN2/dxi =  0.25 * 0.5 = 0.125
             0.25 * (1 + 0.5), // dN3/dxi =  0.25 * 1.5 = 0.375
            -0.25 * (1 + 0.5)  // dN4/dxi = -0.25 * 1.5 = -0.375
        ];

        const expectedDshapedeta: [number, number, number, number] = [
            -0.25 * (1 - 0.5), // dN1/deta = -0.25 * 0.5 = -0.125
            -0.25 * (1 + 0.5), // dN2/deta = -0.25 * 1.5 = -0.375
             0.25 * (1 + 0.5), // dN3/deta =  0.25 * 1.5 = 0.375
             0.25 * (1 - 0.5)  // dN4/deta =  0.25 * 0.5 = 0.125
        ];

        expect(arraysAreClose(result.shape, expectedShape)).toBe(true);
        expect(arraysAreClose(result.dshapedxi, expectedDshapedxi)).toBe(true);
        expect(arraysAreClose(result.dshapedeta, expectedDshapedeta)).toBe(true);
    });
});