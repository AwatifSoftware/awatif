import { NodeInputs } from "awatif-data-structure";

export function getAppliedForces(
  loads: NodeInputs["loads"],
  dof: number
): number[] {
  const forces: number[] = Array(dof).fill(0);

  loads?.forEach((force, key) => {
    forces[key * 6] = force[0];
    forces[key * 6 + 1] = force[1];
    forces[key * 6 + 2] = force[2];
    forces[key * 6 + 3] = force[3];
    forces[key * 6 + 4] = force[4];
    forces[key * 6 + 5] = force[5];
  });

  return forces;
}
