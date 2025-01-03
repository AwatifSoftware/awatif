import {
  Node,
  Element,
  ElementInputs,
  AnalyzeOutputs,
  DeformOutputs,
} from "awatif-data-structure";
import { getTransformationMatrix } from "./utils/getTransformationMatrix";
import { getStiffness } from "./utils/getStiffness";
import { multiply, norm, subset, subtract, index } from "mathjs";

export function analyze(
  nodes: Node[],
  elements: Element[],
  elementInputs: ElementInputs,
  deformOutputs: DeformOutputs
): AnalyzeOutputs {
  const analyzeOutputs: AnalyzeOutputs = {
    normals: new Map(),
    shearsY: new Map(),
    shearsZ: new Map(),
    torsions: new Map(),
    bendingsY: new Map(),
    bendingsZ: new Map(),
  };

  elements.forEach((element, elmIndex) => {
    const node0 = nodes[element[0]];
    const node1 = nodes[element[1]];
    const L = norm(subtract(node1, node0)) as number;

    const dxGlobal = [
      ...deformOutputs.deformations.get(element[0]),
      ...deformOutputs.deformations.get(element[1]),
    ];
    const T = getTransformationMatrix(node0, node1);
    const dxLocal = multiply(T, dxGlobal);
    const kLocal = getStiffness(elementInputs, elmIndex, L);
    let fLocal = multiply(kLocal, dxLocal) as number[];

    analyzeOutputs.normals.set(elmIndex, [fLocal[0], fLocal[6]]);

    // Todo: find a better way to incorporate bars and beams
    const isFrame =
      elementInputs.momentsOfInertiaY?.get(elmIndex) &&
      elementInputs.momentsOfInertiaZ?.get(elmIndex);

    if (isFrame) {
      analyzeOutputs.shearsY.set(elmIndex, [fLocal[1], fLocal[7]]);
      analyzeOutputs.shearsZ.set(elmIndex, [fLocal[2], fLocal[8]]);
      analyzeOutputs.torsions.set(elmIndex, [fLocal[3], fLocal[9]]);
      analyzeOutputs.bendingsY.set(elmIndex, [fLocal[4], fLocal[10]]);
      analyzeOutputs.bendingsZ.set(elmIndex, [fLocal[5], fLocal[11]]);
    }
  });

  return analyzeOutputs;
}
