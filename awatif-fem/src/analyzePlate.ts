import {
  Node,
  QuadrilateralElement,
  AnalysisInputs,
  AnalysisOutputs,
} from "awatif-data-structure";
import { deform } from "./deformPlate";
import { getTransformationMatrix } from "./utils/getTransformationMatrix";
import { getStiffness } from "./utils/getStiffnes";
import { multiply, norm, subset, subtract, index } from "mathjs";

export function analyze(
  nodes: Node[],
  elements: QuadrilateralElement[],
  analysisInputs: AnalysisInputs
): AnalysisOutputs {
  const { deformations, reactions } = deform(nodes, elements, analysisInputs);

  const analysisOutputs: AnalysisOutputs = {
    nodes: new Map(),
    elements: new Map(),
  };

  nodes.forEach((_, index) => {
    const hasReaction = analysisInputs.pointSupports?.get(index);

    analysisOutputs.nodes?.set(index, {
      deformation: [
        deformations[index * 6],
        deformations[index * 6 + 1],
        deformations[index * 6 + 2],
        0,
        0,
        0
      ],
    });
  });


  return analysisOutputs;
}

