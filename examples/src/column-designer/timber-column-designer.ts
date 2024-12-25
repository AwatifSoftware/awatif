import van from "vanjs-core";
import { Glulam } from "./utils";

// Define a type for support conditions
export type SupportType = 'pinned' | 'cantilever' | 'fixed (top)' | 'fixed (bottom)';

export interface ColumnDesignResults {
  column: string;
  utilizationY: number;
  utilizationZ: number;
  slendernessY: number;
  slendernessZ: number;
  area: number;
  sectionModulusY: number;
  sectionModulusZ: number;
  beta: number;
  effectiveLength: number;
  f_c0d: number;
  f_myd: number;
  f_mzd: number;
  radiusOfGyrationY: number;
  radiusOfGyrationZ: number;
  sigma_cd: number;
  sigma_mdY: number;
  sigma_mdZ: number;
}


// Define a function for timber column design
export function timberColumnDesign(
  column: string,  
  support: SupportType,
  length: number,         // length of the column
  width: number,          // width of the column cross-section
  height: number,         // height of the column cross-section
  N_ed: number,           // axial load [N]
  M_yd: number,           // bending moment around y-axis [Nm]
  M_zd: number,           // bending moment around z-axis [Nm]
  grade: Glulam,
  chi: number,          // modification factor
) {
  // Geometry
  const widthh = width * 1000
  const heightt = height * 1000

  const area = widthh * heightt;
  const sectionModulusY = (widthh * Math.pow(heightt, 2)) / 6;
  const sectionModulusZ = (heightt * Math.pow(widthh, 2)) / 6;

  var f_c0k = grade.f_c0k
  var f_myk = grade.f_mk
  var f_mzk = grade.f_mk

  // Effective length coefficient based on support type
  const betaValues: { [key in SupportType]: number } = {
    'pinned': 1,
    'cantilever': 2,
    'fixed (top)': 0.7,
    'fixed (bottom)': 0.7
  };
  const beta = betaValues[support];
  const effectiveLength = length * beta;

  // Adjusted strengths
  const f_c0d = f_c0k * chi;
  const f_myd = f_myk * chi;
  const f_mzd = f_mzk * chi;

  // Slenderness ratio
  const radiusOfGyrationY = height / Math.sqrt(12);
  const radiusOfGyrationZ = width / Math.sqrt(12);
  const slendernessY = effectiveLength / radiusOfGyrationY;
  const slendernessZ = effectiveLength / radiusOfGyrationZ;

  // Compressive stress
  const sigma_cd = 1000 * N_ed / area;

  // Bending stresses
  const sigma_mdY = 1000**2 * M_yd / sectionModulusY;
  const sigma_mdZ = 1000**2 * M_zd / sectionModulusZ;
  
  // console.log(`M_yd = ${M_yd}`,)
  // console.log(`sigma_mdZ = ${sigma_mdZ}`,)

  // Utilization ratios
  const utilizationY = sigma_cd / f_c0d + sigma_mdY / f_myd;
  const utilizationZ = sigma_cd / f_c0d + sigma_mdZ / f_mzd;

  const columnDesignResults: ColumnDesignResults = {
    column: column,
    utilizationY: utilizationY,
    utilizationZ: utilizationZ,
    slendernessY: slendernessY,
    slendernessZ: slendernessZ,
    area: area,
    sectionModulusY: sectionModulusY,
    sectionModulusZ: sectionModulusZ,
    beta: beta,
    effectiveLength: effectiveLength,
    f_c0d: f_c0d,
    f_myd: f_myd,
    f_mzd: f_mzd,
    radiusOfGyrationY: radiusOfGyrationY,
    radiusOfGyrationZ: radiusOfGyrationZ,
    sigma_cd: sigma_cd,
    sigma_mdY: sigma_mdY,
    sigma_mdZ: sigma_mdZ,
  };
  
  return columnDesignResults;
}



