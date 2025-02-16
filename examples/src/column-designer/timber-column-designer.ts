import van from "vanjs-core";
import { Glulam } from "./utils";

// Define a type for support conditions
export type SupportType =
  | "pinned"
  | "cantilever"
  | "fixed (top)"
  | "fixed (bottom)";

// Interface to hold the results of the column design

export interface EntryParams {
  column: string;
  support: number;
  grade: Glulam;
  chi: number;
}

export interface Loads {
  N_ed: number;
  M_yd: number;
  M_zd: number;
}

export interface Geometry {
  length: number;
  width: number;
  height: number;
}

export interface GeometryProperties {
  l_ef: number;
  area: number;
  w_ply: number;
  w_plz: number;
  I_y: number;
  I_z: number;
  i_y: number;
  i_z: number;
}

export interface DesignResistance {
  f_c0d: number;
  f_myd: number;
  f_mzd: number;
}

export interface TimberColumnDesignInput {
  entryParams: EntryParams;
  geometry: Geometry;
  loads: Loads;
}

export interface ColumnDesignResults {
  entryParams: EntryParams;
  loads: Loads;
  geometry: Geometry;
  geometryProperties: GeometryProperties;
  designResistance: DesignResistance;
  compressionCheckResult: CompressionCheckResult;
  bendingCheckResult: BendingCheckResult;
  combinedBendingCompressionCheckResult: CombinedBendingCompressionCheckResult;
  stabilityCheckResult: StabilityCheckResult;
  lTBCheckResult: LTBCheckResult;
  maxEtaY: number,
  maxEtaZ: number,
}

// Function for timber column design
export function timberColumnDesign(
  input: TimberColumnDesignInput
): ColumnDesignResults {
  const { entryParams, loads, geometry } = input;

  // Geometry: Convert to mm (1m = 1000mm)
  const widthh = geometry.width * 1000; // Width in mm
  const heightt = geometry.height * 1000; // Height in mm
  const area = widthh * heightt; // Cross-sectional area in mm²

  // Section moduli and moments of inertia
  const w_ply = (widthh * Math.pow(heightt, 2)) / 6; // Section modulus around y-axis
  const w_plz = (heightt * Math.pow(widthh, 2)) / 6; // Section modulus around z-axis
  const I_y = (widthh * Math.pow(heightt, 3)) / 12; // Moment of inertia around y-axis
  const I_z = (heightt * Math.pow(widthh, 3)) / 12; // Moment of inertia around z-axis
  const i_y = heightt / Math.sqrt(12); // Radius of gyration around y-axis
  const i_z = widthh / Math.sqrt(12); // Radius of gyration around z-axis

  // Effective length coefficient based on support type
  const betaValues: { [key in SupportType]: number } = {
    pinned: 1,
    cantilever: 2,
    "fixed (top)": 0.7,
    "fixed (bottom)": 0.7,
  };
  const beta = betaValues[entryParams.support]; // Support-based coefficient
  const l_ef = length * beta; // Effective length of the column

  var geometryProperties: GeometryProperties = {
    l_ef: l_ef,
    area: area,
    w_ply: w_ply,
    w_plz: w_plz,
    I_y: I_y,
    I_z: I_z,
    i_y: i_y,
    i_z: i_z,
  };

  // Material properties from the grade
  const f_c0k = entryParams.grade.f_c0k;
  const f_myk = entryParams.grade.f_mk;
  const f_mzk = entryParams.grade.f_mk;

  // Adjusted material strengths
  const f_c0d = f_c0k * entryParams.chi;
  const f_myd = f_myk * entryParams.chi;
  const f_mzd = f_mzk * entryParams.chi;

  var designResistance: DesignResistance = {
    f_c0d: f_c0d,
    f_myd: f_myd,
    f_mzd: f_mzd,
  };

  // Clause 6.1.4 Compression parallel to the grain
  var inputCompressionCheckInput: CompressionCheckInput = {
    loads: loads,
    geometryProperties: geometryProperties,
    designResistance: designResistance,
  };

  const compressionCheckResult = checkCompressionParallelToGrain(
    inputCompressionCheckInput
  );

  // Clause 6.1.6 Bending
  var inputBendingCheckInput: BendingCheckInput = {
    loads: loads,
    geometryProperties: geometryProperties,
    designResistance: designResistance,
  };

  const bendingCheckResult = checkBending(inputBendingCheckInput);

  // Clause 6.2.4 Combined bending and axial compression
  var inputCombinedBendingCompressionCheckInput: CombinedBendingCompressionCheckInput =
    {
      loads: loads,
      geometryProperties: geometryProperties,
      designResistance: designResistance,
    };

  const combinedBendingCompressionCheckResult = checkCombinedBendingCompression(
    inputCombinedBendingCompressionCheckInput
  );

  // Clause 6.3.2 Stability
  var inputStabilityCheckInput: StabilityCheckInput = {
    grade: entryParams.grade,
    loads: loads,
    geometryProperties: geometryProperties,
    designResistance: designResistance,
  };

  const stabilityCheckResult = checkStability(inputStabilityCheckInput);

  // Clause 6.3.3 LTB
  var inputLTBCheckInput: LTBCheckInput = {
    grade: entryParams.grade,
    loads: loads,
    geometry: geometry,
    geometryProperties: geometryProperties,
    designResistance: designResistance,
    stabilityCheckResult: stabilityCheckResult,
  };

  const lTBCheckResult = checkLTB(inputLTBCheckInput);

  // max utilization
  const maxEtaY = Math.max(
    compressionCheckResult.etaCheckCompressionParallelToGrain,
    bendingCheckResult.etaCheckBendingY,
    combinedBendingCompressionCheckResult.etaCheckCombinedBendingCompressionY,
    stabilityCheckResult.etaStabilityY,
    lTBCheckResult.etaLTBY,
  );

  const maxEtaZ = Math.max(
    compressionCheckResult.etaCheckCompressionParallelToGrain,
    bendingCheckResult.etaCheckBendingZ,
    combinedBendingCompressionCheckResult.etaCheckCombinedBendingCompressionZ,
    stabilityCheckResult.etaStabilityZ,
    lTBCheckResult.etaLTBZ
  );

  // Return the column design results
  const columnDesignResults: ColumnDesignResults = {
    entryParams: entryParams,
    loads: loads,
    geometry: geometry,
    geometryProperties: geometryProperties,
    designResistance: designResistance,
    compressionCheckResult: compressionCheckResult,
    bendingCheckResult: bendingCheckResult,
    combinedBendingCompressionCheckResult: combinedBendingCompressionCheckResult,
    stabilityCheckResult: stabilityCheckResult,
    lTBCheckResult: lTBCheckResult,
    maxEtaY: maxEtaY,
    maxEtaZ: maxEtaZ,
  };

  return columnDesignResults ;
}

// Clause 6.1.4 Compression parallel to the grain
type CompressionCheckInput = {
  loads: Loads;
  geometryProperties: GeometryProperties;
  designResistance: DesignResistance;
};

type CompressionCheckResult = {
  sigma_c0d: number;
  etaCheckCompressionParallelToGrain: number; // Utilization ratio (sigma_c0d / f_c0d)
};

function checkCompressionParallelToGrain(
  input: CompressionCheckInput
): CompressionCheckResult {
  const { loads, geometryProperties, designResistance } = input;

  // Calculate the design compressive stress
  const sigma_c0d = (loads.N_ed * 1000) / geometryProperties.area;

  // Calculate the utilization ratio (eta)
  const etaCheckCompressionParallelToGrain = sigma_c0d / designResistance.f_c0d;

  return {
    sigma_c0d,
    etaCheckCompressionParallelToGrain,
  };
}

// Clause 6.1.6 Bending
type BendingCheckInput = {
  loads: Loads;
  geometryProperties: GeometryProperties;
  designResistance: DesignResistance;
};

type BendingCheckResult = {
  sigma_myd: number; // Bending stress about the y-axis (N/mm²)
  sigma_mzd: number; // Bending stress about the z-axis (N/mm²)
  etaCheckBendingY: number; // Utilization ratio for bending about the y-axis
  etaCheckBendingZ: number; // Utilization ratio for bending about the z-axis
};

function checkBending(input: BendingCheckInput): BendingCheckResult {
  const { loads, geometryProperties, designResistance } = input;

  // Calculate the design bending stresses
  const sigma_myd = (loads.M_yd * Math.pow(1000, 2)) / geometryProperties.w_ply; // Bending stress about the y-axis
  const sigma_mzd = (loads.M_zd * Math.pow(1000, 2)) / geometryProperties.w_plz; // Bending stress about the z-axis

  // Coefficient for interaction (solid rectangular cross-sections)
  const k_m = 0.7;

  // Calculate the utilization ratios for combined bending stresses
  const etaCheckBendingY =
    sigma_myd / designResistance.f_myd +
    k_m * (sigma_mzd / designResistance.f_mzd);
  const etaCheckBendingZ =
    k_m * (sigma_myd / designResistance.f_myd) +
    sigma_mzd / designResistance.f_mzd;

  return {
    sigma_myd,
    sigma_mzd,
    etaCheckBendingY,
    etaCheckBendingZ,
  };
}

// Clause 6.2.4 Combined bending and axial compression
type CombinedBendingCompressionCheckInput = {
  loads: Loads;
  geometryProperties: GeometryProperties;
  designResistance: DesignResistance;
};

type CombinedBendingCompressionCheckResult = {
  sigma_c0d: number; // Design compressive stress (N/mm²)
  sigma_myd: number; // Bending stress about Y-axis (N/mm²)
  sigma_mzd: number; // Bending stress about Z-axis (N/mm²)
  etaCheckCombinedBendingCompressionY: number; // Utilization ratio for Y-axis
  etaCheckCombinedBendingCompressionZ: number; // Utilization ratio for Z-axis
};

function checkCombinedBendingCompression(
  input: CombinedBendingCompressionCheckInput
): CombinedBendingCompressionCheckResult {
  const { loads, geometryProperties, designResistance } = input;

  // Calculate design compressive stress (N/mm²)
  const sigma_c0d = (loads.N_ed * 1000) / geometryProperties.area;

  // Calculate bending stresses (N/mm²)
  const sigma_myd = (loads.M_yd * 1000 ** 2) / geometryProperties.w_ply; // Bending stress about the y-axis
  const sigma_mzd = (loads.M_zd * 1000 ** 2) / geometryProperties.w_plz; // Bending stress about the z-axis

  // Coefficient for interaction (solid rectangular cross-sections)
  const k_m = 0.7;

  // Calculate utilization ratios for combined bending stresses
  const etaCheckCombinedBendingCompressionY =
    (sigma_c0d / designResistance.f_c0d) ** 2 +
    sigma_myd / designResistance.f_myd +
    k_m * (sigma_mzd / designResistance.f_mzd);

  const etaCheckCombinedBendingCompressionZ =
    (sigma_c0d / designResistance.f_c0d) ** 2 +
    k_m * (sigma_myd / designResistance.f_myd) +
    sigma_mzd / designResistance.f_mzd;

  return {
    sigma_c0d,
    sigma_myd,
    sigma_mzd,
    etaCheckCombinedBendingCompressionY,
    etaCheckCombinedBendingCompressionZ,
  };
}

// Clause 6.3.2 Stability
type StabilityCheckInput = {
  loads: Loads;
  geometryProperties: GeometryProperties;
  designResistance: DesignResistance;
  grade: Glulam;
};

type StabilityCheckResult = {
  sigma_c0d: number; // Design compressive stress (N/mm²)
  sigma_myd: number; // Bending stress about Y-axis (N/mm²)
  sigma_mzd: number; // Bending stress about Z-axis (N/mm²)
  slendernessY: number;
  slendernessZ: number;
  lamb_y: number;
  lamb_rel_y: number;
  k_y_y: number;
  k_c_y: number;
  lamb_z: number;
  lamb_rel_z: number;
  k_y_z: number;
  k_c_z: number;
  etaStabilityY: number;
  etaStabilityZ: number;
};

function checkStability(input: StabilityCheckInput): StabilityCheckResult {
  const { loads, geometryProperties, designResistance, grade } = input;

  // Slenderness ratios
  const slendernessY = geometryProperties.l_ef / geometryProperties.i_y; // Slenderness ratio around y-axis
  const slendernessZ = geometryProperties.l_ef / geometryProperties.i_z; // Slenderness ratio around z-axis

  // Calculate design compressive stress (N/mm²)
  const sigma_c0d = (loads.N_ed * 1000) / geometryProperties.area;

  // Calculate bending stresses (N/mm²)
  const sigma_myd = (loads.M_yd * Math.pow(1000, 2)) / geometryProperties.w_ply; // Bending stress about the y-axis
  const sigma_mzd = (loads.M_zd * Math.pow(1000, 2)) / geometryProperties.w_plz; // Bending stress about the z-axis

  const k_m = 0.7;

  // Slenderness calculation for y-axis
  const lamb_y = (geometryProperties.l_ef * 1000) / geometryProperties.i_y; // Slenderness (absolute) along y-axis
  const lamb_rel_y = (lamb_y / Math.PI) * Math.sqrt(grade.f_c0k / grade.E05); // Relative slenderness along y-axis
  const k_y_y = 0.5 * (1 + 0.1 * (lamb_rel_y - 0.3) + Math.pow(lamb_rel_y, 2)); // Y-axis coefficient
  const k_c_y =
    1 / (k_y_y + Math.sqrt(Math.pow(k_y_y, 2) - Math.pow(lamb_rel_y, 2))); // Y-axis buckling coefficient

  // Slenderness calculation for z-axis
  const lamb_z = (geometryProperties.l_ef * 1000) / geometryProperties.i_z; // Slenderness (absolute) along z-axis
  const lamb_rel_z = (lamb_z / Math.PI) * Math.sqrt(grade.f_c0k / grade.E05); // Relative slenderness along z-axis
  const k_y_z = 0.5 * (1 + 0.1 * (lamb_rel_z - 0.3) + Math.pow(lamb_rel_z, 2)); // Z-axis coefficient
  const k_c_z =
    1 / (k_y_z + Math.sqrt(Math.pow(k_y_z, 2) - Math.pow(lamb_rel_z, 2))); // Z-axis buckling coefficient

  // Calculate utilization ratios for combined bending stresses
  const etaStabilityY =
    sigma_c0d / (k_c_y * designResistance.f_c0d) +
    sigma_myd / designResistance.f_myd +
    k_m * (sigma_mzd / designResistance.f_mzd);

  const etaStabilityZ =
    sigma_c0d / (k_c_z * designResistance.f_c0d) ** 2 +
    k_m * (sigma_myd / designResistance.f_myd) +
    sigma_mzd / designResistance.f_mzd;

  return {
    sigma_c0d,
    sigma_myd,
    sigma_mzd,
    slendernessY,
    slendernessZ,
    lamb_y,
    lamb_rel_y,
    k_y_y,
    k_c_y,
    lamb_z,
    lamb_rel_z,
    k_y_z,
    k_c_z,
    etaStabilityY,
    etaStabilityZ,
  };
}

// Clause 6.3.3 LTB
type LTBCheckInput = {
  loads: Loads;
  geometry: Geometry;
  geometryProperties: GeometryProperties;
  designResistance: DesignResistance;
  grade: Glulam;
  stabilityCheckResult: StabilityCheckResult;
};

type LTBCheckResult = {
  k_crit: number;
  lamb_relm: number;
  etaLTBY: number;
  etaLTBZ: number;
};

function checkLTB(input: LTBCheckInput): LTBCheckResult {
  const {
    loads,
    geometry,
    geometryProperties,
    designResistance,
    grade,
    stabilityCheckResult,
  } = input;

  // Determine the critical axis (based on section modulus)
  const index: number = [
    geometryProperties.w_ply,
    geometryProperties.w_plz,
  ].indexOf(Math.max(geometryProperties.w_ply, geometryProperties.w_plz)); // Index for max section modulus

  let k_crit = 1;

  // Calculate relative slenderness for the critical axis
  const lamb_relm =
    Math.sqrt(
      (geometryProperties.l_ef * 1000) /
        (Math.PI * Math.pow(geometry.width * 1000, 2))
    ) * Math.sqrt(grade.f_mk / Math.sqrt(grade.E05 * grade.G05));

  // Determine the buckling coefficient based on slenderness
  if (lamb_relm <= 0.75) {
    k_crit = 1;
  } else if (lamb_relm > 0.75 && lamb_relm < 1.4) {
    k_crit = 1.56 - 0.75 * lamb_relm;
  } else if (lamb_relm >= 1.4) {
    k_crit = 1 / Math.pow(lamb_relm, 2);
  }

  // check
  const etaLTBY =
    (stabilityCheckResult.sigma_myd / (designResistance.f_myd * k_crit)) ** 2 +
    stabilityCheckResult.sigma_c0d /
      (stabilityCheckResult.k_c_z * designResistance.f_c0d);
  const etaLTBZ =
    (stabilityCheckResult.sigma_mzd / (designResistance.f_mzd * k_crit)) ** 2 +
    stabilityCheckResult.sigma_c0d /
      (stabilityCheckResult.k_c_y * designResistance.f_c0d);

  return {
    k_crit,
    lamb_relm,
    etaLTBY,
    etaLTBZ,
  };
}
