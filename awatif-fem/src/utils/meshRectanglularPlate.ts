import { Node, QuadrilateralElement } from "awatif-data-structure";



export function meshRectangularPlate(
  L: number,
  B: number,
  Nx: number,
  Ny: number,
): { coordinates: Node[]; elements: QuadrilateralElement[];
  nel: number;
  nnode: number;  } {
  // Total number of elements
  const nel = Nx * Ny;
  const nnel = 4; // Number of nodes per element

  // Number of points along length and breadth
  const npx = Nx + 1;
  const npy = Ny + 1;
  const nnode = npx * npy; // Total number of nodes

  // Discretize the length and breadth
  const nx = Array.from({ length: npx }, (_, i) => (i * L) / Nx);
  const ny = Array.from({ length: npy }, (_, i) => (i * B) / Ny);

  // Generate grid of nodes
  const coordinates: Node[] = [];
  for (let j = 0; j < npy; j++) {
    for (let i = 0; i < npx; i++) {
      coordinates.push([nx[i], ny[j], 0]); // z-coordinate is 0 for a flat plate
    }
  }

  // Assign node numbers
  const NodeNo: number[][] = [];
  for (let j = 0; j < npy; j++) {
    NodeNo[j] = [];
    for (let i = 0; i < npx; i++) {
      NodeNo[j][i] = j * npx + i; // Node numbers start from 0
    }
  }

  // Generate element connectivity
  const elements: QuadrilateralElement[] = [];
  for (let j = 0; j < Ny; j++) {
    for (let i = 0; i < Nx; i++) {
      const n1 = NodeNo[j][i];
      const n2 = NodeNo[j][i + 1];
      const n3 = NodeNo[j + 1][i + 1];
      const n4 = NodeNo[j + 1][i];
      elements.push([n1, n2, n3, n4]);
    }
  }

  return { coordinates, elements, nel, nnode };
}