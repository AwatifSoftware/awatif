import * as THREE from "three";
import van, { State } from "vanjs-core";
import { Node } from "awatif-data-structure";
import { Structure } from "awatif-data-structure";
import { Settings } from "../settings/settings";

export function supports(
  structure: Structure,
  settings: Settings,
  derivedNodes: State<Node[]>,
  derivedDisplayScale: State<number>
): THREE.Group {
  const group = new THREE.Group();
  const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const material = new THREE.MeshBasicMaterial({ color: 0x9b2226 });
  const size = 0.05 * settings.gridSize.rawVal * 0.6;

  // on settings.support & deformedShape, and model clear and create visuals
  van.derive(() => {
    settings.deformedShape.val; // triggers update

    if (!settings.supports.val) return;

    group.clear();

    structure.nodeInputs?.val.supports?.forEach((_, index) => {
      const sphere = new THREE.Mesh(geometry, material);

      sphere.position.set(...derivedNodes.rawVal[index]);
      const scale = size * derivedDisplayScale.rawVal;
      sphere.scale.set(scale, scale, scale);

      group.add(sphere);
    });
  });

  // on derivedDisplayScale update scale
  van.derive(() => {
    derivedDisplayScale.val; // triggers update

    if (!settings.supports.rawVal) return;

    const scale = size * derivedDisplayScale.rawVal;
    group.children.forEach((c) => c.scale.set(scale, scale, scale));
  });

  // on settings.supports update visibility
  van.derive(() => {
    group.visible = settings.supports.val;
  });

  return group;
}
