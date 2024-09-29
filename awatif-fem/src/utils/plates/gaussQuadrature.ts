import { GaussPoint2D } from 'awatif-data-structure';

export interface GaussQuadratureResult {
  gaussPoints: GaussPoint2D[];
  gaussWeights: number[];
}

export function gaussQuadrature(order: string): GaussQuadratureResult {
  let gaussPoints: GaussPoint2D[];
  let gaussWeights: number[];

  switch (order) {
    case 'third':
      {
        const sqrt3over5 = Math.sqrt(3 / 5);

        gaussPoints = [
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

        gaussWeights = [
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
      }
      break;

    case 'second':
      {
        const invSqrt3 = 1 / Math.sqrt(3);

        gaussPoints = [
          [-invSqrt3, -invSqrt3],
          [invSqrt3, -invSqrt3],
          [invSqrt3, invSqrt3],
          [-invSqrt3, invSqrt3],
        ];

        gaussWeights = [1, 1, 1, 1];
      }
      break;

    case 'first':
      {
        gaussPoints = [[0, 0]];

        gaussWeights = [4];
      }
      break;

    default:
      throw new Error(`Invalid order: ${order}`);
  }

  return { gaussPoints, gaussWeights };
}