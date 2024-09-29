import { AnalysisInputs } from "awatif-data-structure";

export function getAppliedForcesPlate(
  forcesInputs: AnalysisInputs["pointLoads"],
  dof: number
): number[] {
  const forces: number[] = Array(dof).fill(0);

  forcesInputs?.forEach((force, index) => {
    forces[index * 6] = force[0];
    forces[index * 6 + 1] = force[1];
    forces[index * 6 + 2] = force[2];
  
  });

  return forces;
}
