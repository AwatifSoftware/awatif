import { applyConstraints } from '../plates/applyConstraints';

test('applyConstraints modifies kk and ff correctly', () => {
  // Initial matrices
  const kk = [
    [10, 2, 3],
    [2, 20, 6],
    [3, 6, 30],
  ];
  const ff = [1, 2, 3];
  const bcdof = [1]; // Constrain DOF at index 1

  // Expected results
  const expectedKk = [
    [10, 0, 3],
    [0, 1, 0],
    [3, 0, 30],
  ];
  const expectedFf = [1, 0, 3];

  // Apply constraints
  applyConstraints(kk, ff, bcdof);

  // Assertions
  expect(kk).toEqual(expectedKk);
  expect(ff).toEqual(expectedFf);
});
