import { QuadrilateralElement } from "awatif-data-structure";


export function elementDOF(element: QuadrilateralElement, ndof: number): number[] {
  const index: number[] = [];

  for (const node of element) {
    const start = node * ndof;
    for (let j = 0; j < ndof; j++) {
      index.push(start + j);
    }
  }

  return index;
}