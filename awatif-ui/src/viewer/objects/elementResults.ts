import * as THREE from "three";
import van, { State } from "vanjs-core";
import { AnalyzeOutputs, Node } from "awatif-data-structure";
import { Structure } from "awatif-data-structure";
import { Settings } from "../settings/settings";

import { getTransformationMatrix } from "./utils/getTransformationMatrix";
import { ConstantResult } from "./resultObjects/ConstantResult";
import { LinearResult } from "./resultObjects/LinearResult";
import { IResultObject } from "./resultObjects/IResultObject";

enum ResultType {
  normals = "normals",
  shearsY = "shearsY",
  shearsZ = "shearsZ",
  torsions = "torsions",
  bendingsY = "bendingsY",
  bendingsZ = "bendingsZ",
}

export function elementResults(
  structure: Structure,
  settings: Settings,
  derivedNodes: State<Node[]>,
  deridedDisplayScale: State<number>
): THREE.Group {
  // init
  const group = new THREE.Group();
  const size = 0.05 * settings.gridSize.rawVal;
  const resultObjects = {
    [ResultType.normals]: ConstantResult,
    [ResultType.shearsY]: ConstantResult,
    [ResultType.shearsZ]: ConstantResult,
    [ResultType.torsions]: ConstantResult,
    [ResultType.bendingsY]: LinearResult,
    [ResultType.bendingsZ]: LinearResult,
  };

  // on settings.elementResults & deformedShape, model clear and create visuals
  van.derive(() => {
    settings.deformedShape.val; // triggers update

    if (settings.elementResults.val == "none") return;

    group.children.forEach((c) => (c as IResultObject).dispose());
    group.clear();

    const resultType =
      ResultType[settings.elementResults.rawVal as keyof typeof ResultType];

    structure.analyzeOutputs?.val[resultType]?.forEach((result, index) => {
      const element = structure.elements?.rawVal[index] ?? [0, 1]; // TODO: improve this
      const node1 = derivedNodes.rawVal[element[0]];
      const node2 = derivedNodes.rawVal[element[1]];
      const length = new THREE.Vector3(...node2).distanceTo(
        new THREE.Vector3(...node1)
      );
      const maxResult = findMax(structure.analyzeOutputs?.rawVal[resultType]);
      const normalizedResult = result?.map(
        (n) => n / (maxResult === 0 ? 1 : maxResult)
      );
      const rotation = getTransformationMatrix(node1, node2);
      const resultObject = new resultObjects[resultType](
        node1,
        node2,
        length,
        rotation,
        result ?? [0, 0],
        normalizedResult ?? [0, 0],
        [
          ResultType.normals,
          ResultType.shearsZ,
          ResultType.torsions,
          ResultType.bendingsY,
        ].includes(resultType)
          ? true
          : false
      );

      resultObject.updateScale(size * deridedDisplayScale.rawVal);

      group.add(resultObject);
    });
  });

  // on deridedDisplayScale update scale
  van.derive(() => {
    deridedDisplayScale.val; // trigger updates

    if (settings.elementResults.rawVal == "none") return;

    group.children.forEach((c) =>
      (c as IResultObject).updateScale(size * deridedDisplayScale.rawVal)
    );
  });

  // on settings.elementResults update viability
  van.derive(() => {
    group.visible = settings.elementResults.val != "none";
  });

  return group;
}

function findMax(nodeOutputs: AnalyzeOutputs[ResultType]): number {
  let max: number = 0;

  nodeOutputs?.forEach((node) => {
    const maxInNode = Math.max(...(node ?? [0, 0]));
    if (maxInNode > max) max = maxInNode;
  });

  return max;
}
