import { computeJacobian } from '../computeJacobian';

test('jacobian function computes correct determinant and inverse', () => {
  const nnel = 4;
  const dshapedxi = [-0.25, 0.25, 0.25, -0.25];
  const dshapedeta = [-0.25, -0.25, 0.25, 0.25];
  const xcoord = [0, 1, 1, 0];
  const ycoord = [0, 0, 1, 1];

  const { detjacobian, invjacobian } = computeJacobian(nnel, dshapedxi, dshapedeta, xcoord, ycoord);

  // Expected determinant and inverse
  const expectedDet = 0.25; // For a unit square element
  const expectedInvJacobian = [
    [2, 0],
    [0, 2],
  ];

  expect(detjacobian).toBeCloseTo(expectedDet, 5);
  expect(invjacobian[0][0]).toBeCloseTo(expectedInvJacobian[0][0], 5);
  expect(invjacobian[0][1]).toBeCloseTo(expectedInvJacobian[0][1], 5);
  expect(invjacobian[1][0]).toBeCloseTo(expectedInvJacobian[1][0], 5);
  expect(invjacobian[1][1]).toBeCloseTo(expectedInvJacobian[1][1], 5);
});
