import * as THREE from "three";
import van, { State } from "vanjs-core";
import { Node } from "awatif-data-structure";
import { Structure } from "awatif-data-structure";
import { Settings } from "../settings/settings";

import { IResultObject } from "./resultObjects/IResultObject";
import { NodeResult } from "./resultObjects/NodeResult";

export enum ResultType {
  deformations = "deformations",
  reactions = "reactions",
}

export function nodeResults(
  structure: Structure,
  settings: Settings,
  derivedNodes: State<Node[]>,
  derivedDisplayScale: State<number>
): THREE.Group {
  // init
  const group = new THREE.Group();
  const size = 0.05 * settings.gridSize.rawVal;

  // on settings.nodeResults & deformedShape, and model clear and update visuals
  van.derive(() => {
    settings.deformedShape.val; // triggers update

    if (settings.nodeResults.val == "none") return;

    group.children.forEach((c) => (c as IResultObject).dispose());
    group.clear();

    const resultType =
      ResultType[settings.nodeResults.rawVal as keyof typeof ResultType];

    console.log(settings.nodeResults.rawVal);

    structure.deformOutputs?.val[resultType]?.forEach((output, index) => {
      const nodeResult = new NodeResult(
        derivedNodes.rawVal[index],
        resultType,
        output ?? [0, 0, 0, 0, 0, 0]
      );

      nodeResult.updateScale(size * derivedDisplayScale.rawVal);

      group.add(nodeResult);
    });
  });

  // on derivedDisplayScale update scale
  van.derive(() => {
    derivedDisplayScale.val;

    if (settings.nodeResults.rawVal == "none") return;

    group.children.forEach((c) =>
      (c as IResultObject).updateScale(size * derivedDisplayScale.rawVal)
    );
  });

  // on settings.nodeResults update visibility
  van.derive(() => {
    group.visible = settings.nodeResults.val != "none";
  });

  return group;
}
