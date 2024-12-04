import { Node, Element } from "awatif-data-structure";

export function meshRectangularPlate(
  L: number,
  B: number,
  Nx: number,
  Ny: number
): {
  coordinates: Node[];
  elements: Element[];
} {
  // Total number of elements and nodes
  const nel = Nx * Ny;
  const nnode = (Nx + 1) * (Ny + 1);

  // Number of points along X and Y axes
  const npx = Nx + 1;
  const npy = Ny + 1;

  // Discretize the length and breadth
  const nx = Array.from({ length: npx }, (_, i) => (i * L) / Nx);
  const ny = Array.from({ length: npy }, (_, i) => (i * B) / Ny);

  // Create meshgrid arrays
  const xx: number[][] = [];
  const yy: number[][] = [];
  for (let j = 0; j < npy; j++) {
    xx[j] = [];
    yy[j] = [];
    for (let i = 0; i < npx; i++) {
      xx[j][i] = nx[i];
      yy[j][i] = ny[j];
    }
  }

  // Flatten the meshgrid arrays column-wise to create the coordinates array
  const coordinates: Node[] = [];
  for (let i = 0; i < npx; i++) {
    for (let j = 0; j < npy; j++) {
      coordinates.push([xx[j][i], yy[j][i], 0]); // Z-coordinate is 0
    }
  }

  // Create the NodeNo array to assign node numbers
  const NodeNo: number[][] = [];
  let nodeCounter = 0;
  for (let i = 0; i < npx; i++) {
    for (let j = 0; j < npy; j++) {
      if (!NodeNo[j]) NodeNo[j] = [];
      NodeNo[j][i] = nodeCounter++;
    }
  }

  // Generate element connectivity matching MATLAB's node ordering
  const elements: Element[] = [];
  for (let i = 0; i < npx - 1; i++) {
    for (let j = 0; j < npy - 1; j++) {
      const n1 = NodeNo[j][i];
      const n2 = NodeNo[j][i + 1];
      const n3 = NodeNo[j + 1][i + 1];
      const n4 = NodeNo[j + 1][i];
      elements.push([n1, n2, n3, n4]);
    }
  }

  return { coordinates, elements };
}
