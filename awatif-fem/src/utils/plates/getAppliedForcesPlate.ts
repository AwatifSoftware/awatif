import { NodeInputs } from "awatif-data-structure";

export function getAppliedForcesPlate(
  loads: NodeInputs["loads"],
  dof: number
): number[] {
  const forces: number[] = Array(dof).fill(0);

  loads?.forEach((force, key) => {
    // Here we assume each node has 6 DOF.
    // The function only assigns the first 3 components for the plate analysis.
    forces[key * 6] = force[0];
    forces[key * 6 + 1] = force[1];
    forces[key * 6 + 2] = force[2];
  });

  return forces;
}
