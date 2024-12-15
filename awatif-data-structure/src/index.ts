import { State } from "vanjs-core";
import { TemplateResult } from "lit-html";




// Analytical Model
export type Structure = {
  nodes?: State<Node[]>;
  elements?: State<Element[]>;
  nodeInputs?: State<NodeInputs>;
  elementInputs?: State<ElementInputs>;
  deformOutputs?: State<DeformOutputs>;
  analyzeOutputs?: State<AnalyzeOutputs>;
};

// Analytical Model
export type Structure = {
  nodes?: State<Node[]>;
  elements?: State<Element[]>;
  nodeInputs?: State<NodeInputs>;
  elementInputs?: State<ElementInputs>;
  nodeOutputs?: State<NodeOutputs>;
  elementOutputs?: State<ElementOutputs>;
};

// The geometry of any structure can be represented by these two entities:
export type Node = [number, number, number]; // position coordinates [x,y,z]
export type Element = number[]; // indices of the nodes list

export type NodeInputs = {
  supports?: Map<
    number,
    [boolean, boolean, boolean, boolean, boolean, boolean]
  >;
  loads?: Map<number, [number, number, number, number, number, number]>;
};



export type ElementInputs = {
  elasticity?: Map<number, number>;
  shearModulus?: Map<number, number>;
  area?: Map<number, number>;
  momentOfInertiaZ?: Map<number, number>;
  momentOfInertiaY?: Map<number, number>;
  torsionalConstant?: Map<number, number>;
};

export type NodeOutputs = {
  deformation?: Map<number, [number, number, number, number, number, number]>;
  reaction?: Map<number, [number, number, number, number, number, number]>;
};

export type ElementOutputs = {
  normal?: Map<number, [number, number]>;
  shearY?: Map<number, [number, number]>;
  shearZ?: Map<number, [number, number]>;
  torsion?: Map<number, [number, number]>;
  bendingY?: Map<number, [number, number]>;
  bendingZ?: Map<number, [number, number]>;
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
  slabData: State<Map<number, unknown>>; // any additional data attached to slabs,
  // example (1) -> {analysisInput,designOutput,..}, 1 is slab index from slabs list
};

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

type ColumnDesignInput = EcTimberColumnDesignInput;
type ColumnDesignOutput = EcTimberColumnDesignOutput;

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
