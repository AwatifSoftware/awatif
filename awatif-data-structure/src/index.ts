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

// The geometry of any structure can be represented by these two entities:
export type Node = [number, number, number]; // position coordinates [x,y,z]
export type Element = number[]; // indices of the first and second node in the list of nodes




export type NodeInputs = {
  supports?: Map<
    number,
    [boolean, boolean, boolean, boolean, boolean, boolean]
  >;
  loads?: Map<number, [number, number, number, number, number, number]>;
};



export type ElementInputs = {
  elasticities?: Map<number, number>;
  shearModuli?: Map<number, number>;
  areas?: Map<number, number>;
  momentsOfInertiaZ?: Map<number, number>;
  momentsOfInertiaY?: Map<number, number>;
  torsionalConstants?: Map<number, number>;
  poissonRatios?: Map<number, number>;
  thicknesses?: Map<number, number>;

};





export type DeformOutputs = {
  deformations?: Map<number, [number, number, number, number, number, number]>;
  reactions?: Map<number, [number, number, number, number, number, number]>;
};



export type AnalyzeOutputs = {
  normals?: Map<number, [number, number]>;
  shearsY?: Map<number, [number, number]>;
  shearsZ?: Map<number, [number, number]>;
  torsions?: Map<number, [number, number]>;
  bendingsY?: Map<number, [number, number]>;
  bendingsZ?: Map<number, [number, number]>;
};




