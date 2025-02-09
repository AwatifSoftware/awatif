import { State } from "vanjs-core";
import { TemplateResult } from "lit-html";

// Analytical Model
export type Structure = {
  nodes?: State<Node[]>;
  elements?: State<Element[]>;
  analysisInputs?: State<AnalysisInputs>;
  analysisOutputs?: State<AnalysisOutputs>;
};

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
export type Building = {
  points: State<[number, number, number][]>; // all the points used to define stories, floors, ..etc
  stories: State<number[]>; // example [1,2,3] three stories defined by three points indices from the points list
  columns: State<number[]>; // example [1,2,3] three columns defined by three points indices from the points list
  slabs: State<number[][]>; // example [[1,2,3],[4,5,6,7]] two slabs defined by points indices from the points list
  columnsByStory: State<Map<number, number[]>>; // Grouping of columns by stories,
  // example (1) -> [2,3,4], 1 is the story index from stories list, [2,3,4] indices from columns list
  slabsByStory: State<Map<number, number[]>>; // Grouping of slabs by stories,
  // example (1) -> [2,3,4], 1 is the story index from stories list, [2,3,4] indices from slabs list
  columnData: State<Map<number, ColumnData>>; // any additional data attached to columns,
  // example (1) -> {analysisInput,designOutput,..}, 1 is column index from columns list
  slabData: State<Map<number, SlabData>>; // any additional data attached to slabs,
  // example (1) -> {analysisInput,designOutput,..}, 1 is slab index from slabs list
};

type ColumnAnalysisInput = {
  load: unknown;
  support: unknown;
  section: unknown;
  material: unknown;
};
type ColumnAnalysisOutput = {
  bending: unknown;
  axial: unknown;
};

type EcTimberColumnDesignInput = {
  buildingClass: string;
  strength: number;
};

type EcTimberColumnDesignOutput = {
  slendernessRatio: number;
  utilizationFactor: number;
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

// TODO: update depending the slab design function requirements
type SlabAnalysisInput = {
  areaLoad: number;
  isOpening: boolean;
  section?: SectionInput;
  material?: MaterialInput;
};

type SlabData = {
  analysisInput?: SlabAnalysisInput;
  analysisOutput?: unknown;
  designInput?: unknown;
  designOutput?: unknown;
  script?: (
    analysisInput: SlabAnalysisInput,
    designInput: unknown
  ) => unknown;
  report?: (
    analysisInput: SlabAnalysisInput,
    designInput: unknown,
    analysisOutput: unknown,
    designOutput: unknown
  ) => TemplateResult;
  visualObject?: (inputs: unknown) => unknown;
};