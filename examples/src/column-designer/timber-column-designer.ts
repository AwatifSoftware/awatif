import van from "vanjs-core";

// Define a type for support conditions
export type SupportType = 'pinned' | 'cantilever' | 'fixed (top)' | 'fixed (bottom)';

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
  f_c0k: number,          // characteristic compressive strength parallel to grain [MPa]
  f_myk: number,          // characteristic bending strength around y-axis [MPa]
  f_mzk: number,          // characteristic bending strength around z-axis [MPa]
  E_modulus: number,      // modulus of elasticity [MPa]
  G_05: number,           // shear modulus [MPa]
  k_mod: number,          // modification factor
  gamma: number           // partial safety factor
) {
  // Geometry
  const widthh = width * 1000
  const heightt = height * 1000

  const area = widthh * heightt;
  const sectionModulusY = (widthh * Math.pow(heightt, 2)) / 6;
  const sectionModulusZ = (heightt * Math.pow(widthh, 2)) / 6;

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
  const f_c0d = f_c0k * (k_mod / gamma);
  const f_myd = f_myk * (k_mod / gamma);
  const f_mzd = f_mzk * (k_mod / gamma);

  // Slenderness ratio
  const radiusOfGyrationY = height / Math.sqrt(12);
  const radiusOfGyrationZ = width / Math.sqrt(12);
  const slendernessY = effectiveLength / radiusOfGyrationY;
  const slendernessZ = effectiveLength / radiusOfGyrationZ;

  // Compressive stress
  const sigma_cd = 1000 * N_ed / area;
  console.log(sigma_cd)

  // Bending stresses
  const sigma_mdY = M_yd / sectionModulusY;
  const sigma_mdZ = M_zd / sectionModulusZ;

  // Utilization ratios
  const utilizationY = sigma_cd / f_c0d + sigma_mdY / f_myd;
  const utilizationZ = sigma_cd / f_c0d + sigma_mdZ / f_mzd;

  // Check results

  const results = [
    column,
    slendernessY.toFixed(1),
    slendernessZ.toFixed(1),
    utilizationY.toFixed(2),
    utilizationZ.toFixed(2),
  ];

  return results;
}

// Example usage:
const result = timberColumnDesign(
  "Col1",  
  'pinned',
  5000,       // Length in mm
  200,        // Width in mm
  300,        // Height in mm
  100000,     // Axial load in N
  50000,      // Bending moment around y-axis in Nm
  40000,      // Bending moment around z-axis in Nm
  24,         // Characteristic compressive strength in MPa
  30,         // Bending strength around y-axis in MPa
  28,         // Bending strength around z-axis in MPa
  12000,      // Modulus of elasticity in MPa
  500,        // Shear modulus in MPa
  0.9,        // Modification factor
  1.3         // Partial safety factor
);

