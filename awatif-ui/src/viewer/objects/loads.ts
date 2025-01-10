import * as THREE from "three";
import van, { State } from "vanjs-core";
import { Node } from "awatif-data-structure";
import { Structure } from "awatif-data-structure";
import { Settings } from "../settings/settings";

export function loads(
  structure: Structure,
  settings: Settings,
  derivedNodes: State<Node[]>,
  derivedDisplayScale: State<number>
): THREE.Group {
  const group = new THREE.Group();
  const size = 0.05 * settings.gridSize.rawVal;

  // on settings.loads & deformedShape, and model clear and create visuals
  van.derive(() => {
    settings.deformedShape.val; // trigger update

    if (!settings.loads.val) return;

    group.children.forEach((o) => (o as THREE.ArrowHelper).dispose());
    group.clear();
    structure.nodeInputs?.val.loads?.forEach((load, index) => {
      const arrow = new THREE.ArrowHelper(
        new THREE.Vector3(...load.slice(0, 3)).normalize(),
        new THREE.Vector3(...derivedNodes.rawVal[index]),
        1,
        0xee9b00,
        0.3,
        0.3
      );

      const scale = size * derivedDisplayScale.rawVal;
      arrow.scale.set(scale, scale, scale);

      group.add(arrow);
    });
  });

  // on derivedDisplayScale update scale
  van.derive(() => {
    derivedDisplayScale.val; // triggers update

    if (!settings.loads.rawVal) return;

    const scale = size * derivedDisplayScale.rawVal;
    group.children.forEach((c) => c.scale.set(scale, scale, scale));
  });

  // on settings.loads update update visibility
  van.derive(() => {
    group.visible = settings.loads.val;
  });

  return group;
}
