import * as THREE from "three";
import van, { State } from "vanjs-core";
import { Node, Structure } from "awatif-data-structure";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { Settings } from "./settings/settings";
import { settings as settingsElement } from "./settings/settings";
import { nodes } from "./objects/nodes";
import { elements } from "./objects/elements";
import { grid } from "./objects/grid";
import { supports } from "./objects/supports";
import { loads } from "./objects/loads";
import { nodesIndexes } from "./objects/nodesIndexes";
import { elementsIndexes } from "./objects/elementsIndexes";
import { axes } from "./objects/axes";
import { orientations } from "./objects/orientations";
import { elementResults } from "./objects/elementResults";
import { nodeResults } from "./objects/nodeResults";

import "./styles.css";
import { drawing, Drawing } from "./drawing/drawing";
import { TemplateResult } from "lit-html";
import { report } from "./report/report";

export type SettingsObj = {
  gridSize?: number;
  displayScale?: number;
  nodes?: boolean;
  elements?: boolean;
  nodesIndexes?: boolean;
  elementsIndexes?: boolean;
  orientations?: boolean;
  supports?: boolean;
  loads?: boolean;
  deformedShape?: boolean;
  elementResults?: string;
  nodeResults?: string;
  flipAxes?: boolean;
};

export function viewer({
  structure,
  settingsObj,
  objects3D,
  drawingObj,
  reportObj,
}: {
  structure?: Structure;
  settingsObj?: SettingsObj;
  objects3D?: State<THREE.Object3D[]>;
  drawingObj?: Drawing;
  reportObj?: {
    template: (data: State<object>) => TemplateResult;
    data: State<object>;
  };
}): HTMLDivElement {
  // init
  THREE.Object3D.DEFAULT_UP = new THREE.Vector3(0, 0, 1);

  const viewerElm = document.createElement("div");
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    45,
    1,
    0.1,
    2 * 1e6 // supported view till 1e6
  );
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  const controls = new OrbitControls(camera, renderer.domElement);

  const settings = getDefaultSettings(settingsObj);
  const derivedDisplayScale = van.derive(() =>
    settings.displayScale.val === 0
      ? 1
      : settings.displayScale.val > 0
      ? settings.displayScale.val
      : -1 / settings.displayScale.val
  );
  const derivedNodes = deriveNodes(structure, settings);
  const gridObj = grid(settings.gridSize.rawVal);

  // update
  viewerElm.setAttribute("id", "viewer");
  viewerElm.appendChild(renderer.domElement);

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x000000, 1);

  const gridSize = settings.gridSize.rawVal;
  const z2fit = gridSize * 0.5 + (gridSize * 0.5) / Math.tan(45 * 0.5);
  camera.position.set(0.5 * gridSize, 0.8 * -z2fit, 0.5 * gridSize);
  controls.target.set(0.5 * gridSize, 0.5 * gridSize, 0);
  controls.minDistance = 1;
  controls.maxDistance = z2fit * 1.5;
  controls.zoomSpeed = 10;
  controls.update();

  scene.add(gridObj, axes(settings.gridSize.rawVal, settings.flipAxes.rawVal));

  if (structure) {
    viewerElm.appendChild(settingsElement(structure, settings));

    scene.add(
      nodes(settings, derivedNodes, derivedDisplayScale),
      elements(structure, settings, derivedNodes),
      nodesIndexes(settings, derivedNodes, derivedDisplayScale),
      elementsIndexes(structure, settings, derivedNodes, derivedDisplayScale),
      supports(structure, settings, derivedNodes, derivedDisplayScale),
      loads(structure, settings, derivedNodes, derivedDisplayScale),
      orientations(structure, settings, derivedNodes, derivedDisplayScale),
      elementResults(structure, settings, derivedNodes, derivedDisplayScale),
      nodeResults(structure, settings, derivedNodes, derivedDisplayScale)
    );
  }

  if (drawingObj)
    drawing({
      drawingObj,
      gridObj,
      scene,
      camera,
      controls,
      gridSize,
      derivedDisplayScale,
      viewerRender,
    });

  if (reportObj) viewerElm.append(report(reportObj));

  // on size change
  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const width = entry.target?.clientWidth;
      const height = entry.target?.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      viewerRender();
    }
  });

  resizeObserver.observe(viewerElm);

  // on controls change
  controls.addEventListener("change", viewerRender);

  // on structure or settings change: render
  van.derive(() => {
    structure?.nodes?.val;
    structure?.elements?.val;
    structure?.nodeInputs?.val;
    structure?.elementInputs?.val;
    structure?.deformOutputs?.val;
    structure?.analyzeOutputs?.val;

    settings.displayScale.val;
    settings.nodes.val;
    settings.elements.val;
    settings.nodesIndexes.val;
    settings.elementsIndexes.val;
    settings.orientations.val;
    settings.supports.val;
    settings.loads.val;
    settings.deformedShape.val;
    settings.elementResults.val;
    settings.nodeResults.val;

    setTimeout(viewerRender); // setTimeout to ensure render is called after all updates are done in that event tick
  });

  // on objects3D change add/remove objects from the scene
  van.derive(() => {
    if (!objects3D?.val.length) return;

    scene.remove(...objects3D.oldVal);
    scene.add(...objects3D.rawVal);

    viewerRender();
  });

  // Object's functions (Actions)
  function viewerRender() {
    renderer.render(scene, camera);
  }

  return viewerElm;
}

// Utils
function getDefaultSettings(settingsObj: SettingsObj): Settings {
  return {
    gridSize: van.state(settingsObj?.gridSize ?? 20),
    displayScale: van.state(settingsObj?.displayScale ?? 1),
    nodes: van.state(settingsObj?.nodes ?? true),
    elements: van.state(settingsObj?.elements ?? true),
    nodesIndexes: van.state(settingsObj?.nodesIndexes ?? false),
    elementsIndexes: van.state(settingsObj?.elementsIndexes ?? false),
    orientations: van.state(settingsObj?.orientations ?? false),
    supports: van.state(settingsObj?.supports ?? true),
    loads: van.state(settingsObj?.loads ?? true),
    deformedShape: van.state(settingsObj?.deformedShape ?? false),
    elementResults: van.state(settingsObj?.elementResults ?? "none"),
    nodeResults: van.state(settingsObj?.nodeResults ?? "none"),
    flipAxes: van.state(settingsObj?.flipAxes ?? false),
  };
}

function deriveNodes(
  structure: Structure | undefined,
  settings: Settings
): Structure["nodes"] {
  return van.derive(() => {
    if (!settings.deformedShape.val) return structure?.nodes?.val ?? [];

    return (
      structure?.nodes?.val.map((node, index) => {
        const d = structure?.deformOutputs?.val.deformations
          ?.get(index)
          ?.slice(0, 3) ?? [0, 0, 0];
        return node.map((n, i) => n + d[i]) as Node;
      }) ?? []
    );
  });
}
