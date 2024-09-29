/**
 * Computes the list of free degrees of freedom (DOFs) for the plate model,
 * excluding the DOFs constrained by boundary conditions.
 *
 * @param constrainedDOFs - An array of constrained DOF indices obtained from boundaryCondition.
 * @param totalDOF - The total number of DOFs in the system.
 * @returns An array of free DOF indices.
 */
export function getFreeIndicesPlate(
  constrainedDOFs: number[],
  totalDOF: number
): number[] {
  return Array.from({ length: totalDOF }, (_, i) => i).filter(
    (dof) => !constrainedDOFs.includes(dof)
  );
}
