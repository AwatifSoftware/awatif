import { State } from "vanjs-core";
import { TemplateResult } from "lit-html";

// Analytical Model
// The geometry of any structure can be represented by these two entities:
export type Node = [number, number, number]; // position coordinates [x,y,z]
export type Element = number[]; // indices of the first and second node in the list of nodes

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
  elasticity: number;
  shearModulus?: number;
  mass?: number;
};

export type SectionInput = {
  area?: number;
  momentOfInertiaZ?: number;
  momentOfInertiaY?: number;
  torsionalConstant?: number;
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

// High-order Model
type ColumnAnalysisInput = {
  load: [number, number, number];  // Ned, Myd, Mzd
  support: string;
  section: unknown;
  material: string;
};
type ColumnAnalysisOutput = {
  axial: unknown;
  bending: unknown;
};

type EcTimberColumnDesignInput = {
  buildingClass: string;
  strength: number;
};

type EcTimberColumnDesignOutput = {
  slendernessRatio: [number, number]; //y and z direction
  utilizationFactor: [number, number]; //y and z direction
};

type ColumnDesignInput = EcTimberColumnDesignInput;
type ColumnDesignOutput = EcTimberColumnDesignOutput;

// Todo: think of way to separate the generic type ColumnAnalysisInput from the remaining specific onces
// Todo: maybe better to separate functions from data
type ColumnData = {
  analysisInput?: ColumnAnalysisInput;
  analysisOutput?: ColumnAnalysisOutput;
  designInput?: ColumnDesignInput;
  designOutput?: ColumnDesignOutput;
  script?: (
    analysisInput: ColumnAnalysisInput,
    designInput: ColumnDesignInput
  ) => ColumnDesignOutput;
  report?: (
    analysisInput: ColumnAnalysisInput,
    designInput: ColumnDesignInput,
    analysisOutput: ColumnAnalysisOutput,
    designOutput: ColumnDesignOutput
  ) => TemplateResult;
  visualObject?: (inputs: unknown) => unknown;
};

export type Building = {
  points: State<[number, number, number][]>; // all the points used to define stories, floors, ..etc
  stories: State<number[]>; // example [1,2,3] three stories defined by three points indices from the points list
  columns: State<Map<number, number[]>>; // example 2 -> [1,2,3] the keys of this map represent the story index
  // and the value is a list of point indices represent the column location at this story
  slabs: State<Map<number, number[][]>>; // example 2 -> [[1,2,3],[4,5,6,7]] the keys of this map represent the story index
  // and the value is a list of polygons at this story represented by point indices
  columnData: State<Map<[number, number], ColumnData>>;
  slabData: State<Map<[number, number], ColumnData>>;
};

export type Structure = {
  building?: Building;
  nodes?: State<Node[]>;
  elements?: State<Element[]>;
  analysisInputs?: State<AnalysisInputs>;
  analysisOutputs?: State<AnalysisOutputs>;
};
