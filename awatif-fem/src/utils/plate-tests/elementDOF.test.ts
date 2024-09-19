// elementDOF.test.ts

import { elementDOF } from '../elementDOF';
import { QuadrilateralElement } from 'awatif-data-structure';

describe('elementDOF', () => {
  test('Computes global DOF indices for a basic quadrilateral element', () => {
    const element: QuadrilateralElement = [0, 1, 2, 3];
    const ndof = 3;
    const expectedIndex = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

    const index = elementDOF(element, ndof);

    expect(index).toEqual(expectedIndex);
  });

  test('Computes global DOF indices for a quadrilateral element with higher node indices', () => {
    const element: QuadrilateralElement = [4, 5, 6, 7];
    const ndof = 3;
    const expectedIndex = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

    const index = elementDOF(element, ndof);

    expect(index).toEqual(expectedIndex);
  });

  test('Computes global DOF indices for a quadrilateral element with non-consecutive node indices', () => {
    const element: QuadrilateralElement = [2, 5, 7, 3];
    const ndof = 3;
    const expectedIndex = [6, 7, 8, 15, 16, 17, 21, 22, 23, 9, 10, 11];

    const index = elementDOF(element, ndof);

    expect(index).toEqual(expectedIndex);
  });
});