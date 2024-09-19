import { gaussQuadrature, GaussQuadratureResult } from '../gaussQuadrature';
import { GaussPoint2D } from 'awatif-data-structure';

describe('gaussQuadrature', () => {
  test('returns correct Gauss points and weights for first-order quadrature', () => {
    const order = 'first';
    const expectedGaussPoints: GaussPoint2D[] = [[0, 0]];
    const expectedGaussWeights: number[] = [4];

    const result: GaussQuadratureResult = gaussQuadrature(order);

    expect(result.gaussPoints).toEqual(expectedGaussPoints);
    expect(result.gaussWeights).toEqual(expectedGaussWeights);
  });

  test('returns correct Gauss points and weights for second-order quadrature', () => {
    const order = 'second';
    const invSqrt3 = 1 / Math.sqrt(3);
    const expectedGaussPoints: GaussPoint2D[] = [
      [-invSqrt3, -invSqrt3],
      [invSqrt3, -invSqrt3],
      [invSqrt3, invSqrt3],
      [-invSqrt3, invSqrt3],
    ];
    const expectedGaussWeights: number[] = [1, 1, 1, 1];

    const result: GaussQuadratureResult = gaussQuadrature(order);

    expect(result.gaussPoints).toEqual(expectedGaussPoints);
    expect(result.gaussWeights).toEqual(expectedGaussWeights);
  });

  test('returns correct Gauss points and weights for third-order quadrature', () => {
    const order = 'third';
    const sqrt3over5 = Math.sqrt(3 / 5);
    const expectedGaussPoints: GaussPoint2D[] = [
      [-sqrt3over5, -sqrt3over5],
      [0, -sqrt3over5],
      [sqrt3over5, -sqrt3over5],
      [-sqrt3over5, 0],
      [0, 0],
      [sqrt3over5, 0],
      [-sqrt3over5, sqrt3over5],
      [0, sqrt3over5],
      [sqrt3over5, sqrt3over5],
    ];
    const expectedGaussWeights: number[] = [
      25 / 81,
      40 / 81,
      25 / 81,
      40 / 81,
      64 / 81,
      40 / 81,
      25 / 81,
      40 / 81,
      25 / 81,
    ];

    const result: GaussQuadratureResult = gaussQuadrature(order);

    expect(result.gaussPoints).toEqual(expectedGaussPoints);
    expect(result.gaussWeights).toEqual(expectedGaussWeights);
  });
});