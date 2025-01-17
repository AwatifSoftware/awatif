import * as THREE from "three";
import van, { State } from "vanjs-core";
import { animateGrid } from "./animateGrid/animateGrid";
import { drawPoints } from "./drawPoints/drawPoints";

export type Drawing = {
  points?: State<[number, number, number][]>;
  // todo: topology?: State<number[][]>;
  gridTarget?: State<{
    position: [number, number, number];
    rotation: [number, number, number];
  }>;
};

export function drawing({
  drawingObj,
  gridObj,
  scene,
  camera,
  controls,
  gridSize,
  derivedDisplayScale,
  viewerRender,
}: {
  drawingObj: Drawing;
  gridObj: THREE.GridHelper;
  scene: THREE.Scene;
  camera: THREE.Camera;
  controls: THREE.Controls<any>;
  gridSize: number;
  derivedDisplayScale: State<number>;
  viewerRender: () => void;
}) {
  if (drawingObj.points)
    drawPoints({
      drawingObj,
      scene,
      camera,
      controls,
      gridSize,
      derivedDisplayScale,
      viewerRender,
    });

  if (drawingObj.gridTarget)
    animateGrid({ gridObj, gridTarget: drawingObj.gridTarget, viewerRender });
}
