import { Node } from "awatif-data-structure";

/**
 * Determines the constrained degrees of freedom based on boundary conditions.
 *
 * @param typeBC - String indicating the boundary condition type (e.g., 'ss-ss-ss-ss', 'c-c-c-c').
 * @param coordinates - Array of nodes, where each node is [x, y, z].
 * @returns An array of constrained DOF indices.
 */
export function boundaryCondition(
  typeBC: string,
  coordinates: Node[]
): number[] {
  // Extract x and y coordinates
  const xCoordinates = coordinates.map(coord => coord[0]);
  const yCoordinates = coordinates.map(coord => coord[1]);

  // Find minimum and maximum x and y values
  const minX = Math.min(...xCoordinates);
  const maxX = Math.max(...xCoordinates);
  const minY = Math.min(...yCoordinates);
  const maxY = Math.max(...yCoordinates);

  // Define a tolerance for coordinate comparisons
  const tolerance = 1e-8;

  // Identify nodes along each edge
  const L1 = coordinates
    .map((coord, index) => ({ coord, index }))
    .filter(({ coord }) => Math.abs(coord[1] - minY) < tolerance)
    .map(({ index }) => index);

  const L2 = coordinates
    .map((coord, index) => ({ coord, index }))
    .filter(({ coord }) => Math.abs(coord[0] - maxX) < tolerance)
    .map(({ index }) => index);

  const L3 = coordinates
    .map((coord, index) => ({ coord, index }))
    .filter(({ coord }) => Math.abs(coord[1] - maxY) < tolerance)
    .map(({ index }) => index);

  const L4 = coordinates
    .map((coord, index) => ({ coord, index }))
    .filter(({ coord }) => Math.abs(coord[0] - minX) < tolerance)
    .map(({ index }) => index);

  switch (typeBC) {
    case 'ss-ss-ss-ss':
      

      const dofSS: number[] = [];

      // Nodes along L1 and L3 (edges along x-axis)
      for (const nodeIndex of [...L1, ...L3]) {
        const wDOF = 3 * nodeIndex;
        const thetaxDOF = 3 * nodeIndex + 1;

        dofSS.push(wDOF, thetaxDOF);
      }

      // Nodes along L2 and L4 (edges along y-axis)
      for (const nodeIndex of [...L2, ...L4]) {
        const wDOF = 3 * nodeIndex;
        const thetayDOF = 3 * nodeIndex + 2;

        dofSS.push(wDOF, thetayDOF);
      }

      // Remove duplicates and sort
      const bcdofSS = Array.from(new Set(dofSS)).sort((a, b) => a - b);
      return bcdofSS;

    case 'c-c-c-c':
  

      const dofCC: number[] = [];

      // Nodes along L1 and L3 (edges along x-axis)
      for (const nodeIndex of [...L1, ...L3]) {
        const wDOF = 3 * nodeIndex;
        const thetayDOF = 3 * nodeIndex + 2;

        dofCC.push(wDOF, thetayDOF);
      }

      // Nodes along L2 and L4 (edges along y-axis)
      for (const nodeIndex of [...L2, ...L4]) {
        const wDOF = 3 * nodeIndex;
        const thetaxDOF = 3 * nodeIndex + 1;

        dofCC.push(wDOF, thetaxDOF);
      }

      // Remove duplicates and sort
      const bcdofCC = Array.from(new Set(dofCC)).sort((a, b) => a - b);
      return bcdofCC;

    default:
      throw new Error(`Unsupported boundary condition type: ${typeBC}`);
  }
}
