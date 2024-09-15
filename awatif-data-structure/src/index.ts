import { State } from "vanjs-core";

// The geometry of any structure can be represented by these two entities:
export type Node = [number, number, number]; // position coordinates [x,y,z]
export type Element = [number, number]; // indices of the first and second node in the list of nodes

// Analysis Inputs
export type AnalysisInputs = {
  materials?: Map<number, MaterialInput>;
  sections?: Map<number, SectionInput>;
  pointSupports?: Map<
    number,
    [boolean, boolean, boolean, boolean, boolean, boolean]
  >;
  pointLoads?: Map<number, [number, number, number, number, number, number]>;
};

export type MaterialInput = {
  elasticity: number; // Young's modulus E
  shearModulus?: number; // Shear modulus G
  poisson?: number; // Poisson's ratio ν
  density?: number; // Material density (optional)
};

export type SectionInput = {
  area?: number;
  momentOfInertiaZ?: number;
  momentOfInertiaY?: number;
  torsionalConstant?: number;
  thickness?: number; // Plate thickness t
};

// Analysis Outputs
export type AnalysisOutputs = {
  nodes?: Map<number, NodeAnalysisOutputs>;
  elements?: Map<number, ElementAnalysisOutputs>;
};

type NodeAnalysisOutputs = {
  deformation?: [number, number, number, number, number, number];
  reaction?: [number, number, number, number, number, number];
};

type ElementAnalysisOutputs = {
  normal?: [number, number];
  shearY?: [number, number];
  shearZ?: [number, number];
  torsion?: [number, number];
  bendingY?: [number, number];
  bendingZ?: [number, number];
};

export type Structure = {
  nodes?: State<Node[]>;
  elements?: State<Element[]>;
  analysisInputs?: State<AnalysisInputs>;
  analysisOutputs?: State<AnalysisOutputs>;
};
