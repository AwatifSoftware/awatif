import * as THREE from "three";
import van, { State } from "vanjs-core";

export type Drawing = {
  points?: State<[number, number, number][]>;
  // todo: topology?: State<number[][]>;
  // todo: planeNormal?: State<[number, number, number]>;
};

export function drawing({
  drawingObj,
  gridSize,
  derivedDisplayScale,
  scene,
  camera,
  renderer,
  controls,
}: {
  drawingObj: Drawing;
  gridSize: number;
  derivedDisplayScale: State<number>;
  scene: THREE.Scene;
  camera: THREE.Camera;
  renderer: THREE.Renderer;
  controls: THREE.Controls<any>;
}) {
  // Init
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(gridSize, gridSize),
    new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })
  );
  const points = new THREE.Points(
    new THREE.BufferGeometry(),
    new THREE.PointsMaterial()
  );

  const indicationPoint = new THREE.Points(
    new THREE.BufferGeometry(),
    new THREE.PointsMaterial({ color: "gray" })
  );

  let pointerdown = false;
  let pointerDownAndMovedCount = 0;

  // Update
  plane.position.set(0.5 * gridSize, 0.5 * gridSize, 0);
  plane.updateMatrixWorld(); // to fix intersect object

  points.geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(drawingObj.points.rawVal.flat(), 3)
  );
  points.geometry.computeBoundingSphere();
  points.frustumCulled = false;

  indicationPoint.frustumCulled = false;
  scene.add(indicationPoint);

  // Events
  // Compute pointerDownAndMovedCount (dragging)
  window.addEventListener("pointerdown", () => {
    pointerdown = true;
  });

  window.addEventListener("pointerup", () => {
    pointerdown = false;
  });

  window.addEventListener("pointermove", () => {
    if (pointerdown) pointerDownAndMovedCount++;
  });

  // On pointer click add a point
  window.addEventListener("pointerup", (event: PointerEvent) => {
    // handle when rotation and click happen together
    if (pointerDownAndMovedCount > 5) {
      pointerDownAndMovedCount = 0;
      return;
    }
    pointerDownAndMovedCount = 0;

    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const intersect = raycaster.intersectObject(plane);

    if (intersect.length) {
      drawingObj.points.val = [
        ...drawingObj.points.rawVal,
        intersect[0].point.toArray(),
      ];
    }
  });

  // On pointer move and intersection with plan show indication point
  window.addEventListener("pointermove", (event: PointerEvent) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const intersect = raycaster.intersectObject(plane);

    indicationPoint.geometry.deleteAttribute("position"); // delete point if not intersection

    if (intersect.length) {
      indicationPoint.geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(intersect[0].point.toArray(), 3)
      );
    }

    renderer.render(scene, camera);
  });

  // On pointer drag and intersection with a point update point position
  let intersectWithPoint = false;
  let pointIndex: number | undefined;
  window.addEventListener("pointermove", (event: PointerEvent) => {
    if (!pointerDownAndMovedCount) return;

    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const intersect = raycaster.intersectObject(points);

    // < 5 to not trigger with rotation
    if (intersect.length && pointerDownAndMovedCount < 5) {
      intersectWithPoint = true;
      controls.enabled = false;
      pointIndex = intersect[0].index;
    }

    if (intersectWithPoint) {
      const intersect = raycaster.intersectObject(plane);
      if (!intersect.length) return;

      if (pointerDownAndMovedCount % 2 !== 0) return; // slow movements for (parametric) performance opt 5

      const newPoints = [...drawingObj.points.rawVal];
      if (pointIndex !== undefined)
        newPoints[pointIndex] = intersect[0].point.toArray();
      drawingObj.points.val = newPoints;
    }
  });

  window.addEventListener("pointerup", () => {
    controls.enabled = true;
    intersectWithPoint = false;
  });

  // On pointer move and intersection with a point hide indication point
  window.addEventListener("pointermove", (event: PointerEvent) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const intersect = raycaster.intersectObject(points);

    indicationPoint.visible = intersect.length ? false : true;
  });

  // On points change update points positions for intersections
  van.derive(() => {
    points.geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(drawingObj.points.val.flat(), 3)
    );
    points.geometry.computeBoundingSphere();
  });

  // On derivedDisplayScale update indicationPoint size and point threshold
  van.derive(() => {
    const size = 0.05 * gridSize * 0.5 * derivedDisplayScale.val;

    indicationPoint.material.size = size;
    raycaster.params.Points.threshold = 0.4 * size;
  });
}
