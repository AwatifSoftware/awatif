import * as THREE from "three";
import van, { State } from "vanjs-core";

export type Drawing = {
  points?: State<[number, number, number][]>;
  polylines?: State<number[][]>;
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

  // Update
  points.geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(drawingObj.points.rawVal.flat(), 3)
  );
  points.geometry.computeBoundingSphere();
  points.frustumCulled = false;

  indicationPoint.frustumCulled = false;
  scene.add(indicationPoint);

  // to start with an empty polyline
  if (drawingObj.polylines)
    drawingObj.polylines.val = [...drawingObj.polylines.rawVal, []];

  // Match initial grid position and rotation
  plane.position.set(0.5 * gridSize, 0.5 * gridSize, 0);
  plane.rotateX(Math.PI / 2);
  plane.geometry.rotateX(Math.PI / 2);
  plane.updateMatrixWorld(); // to fix intersect object

  // On gridTarget change: interpolate grid and update plane position and rotation
  van.derive(() => {
    interpolate(
      gridObj,
      {
        position: new THREE.Vector3(...drawingObj.gridTarget.val.position),
        quaternion: new THREE.Quaternion().setFromEuler(
          new THREE.Euler(...drawingObj.gridTarget.val.rotation)
        ),
      },
      viewerRender
    );

    plane.position.set(...drawingObj.gridTarget.val.position);
    plane.quaternion.setFromEuler(
      new THREE.Euler(...drawingObj.gridTarget.val.rotation)
    );
    plane.updateMatrixWorld(); // to fix intersect object
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

  // pointer events
  let pointerdown = false;
  let pointerDownAndMovedCount = 0;

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
  window.addEventListener("click", (event: PointerEvent) => {
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

      if (drawingObj.polylines) {
        drawingObj.polylines.val = [
          ...drawingObj.polylines.rawVal.slice(0, -1),
          [
            ...(drawingObj.polylines.rawVal.length
              ? drawingObj.polylines.rawVal.pop()
              : []),
            drawingObj.points.rawVal.length - 1,
          ],
        ];
      }
    }
  });

  // On pointer contextmenu add a new empty polyline
  window.addEventListener("contextmenu", () => {
    if (
      !drawingObj.polylines ||
      drawingObj.polylines.rawVal[drawingObj.polylines.rawVal.length - 1]
        .length === 0
    )
      return;

    drawingObj.polylines.val = [...drawingObj.polylines.rawVal, []];
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

    viewerRender();
  });

  // On pointer move and intersection with a point hide indication point
  window.addEventListener("pointermove", (event: PointerEvent) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const intersect = raycaster.intersectObject(points);

    indicationPoint.visible = intersect.length ? false : true;
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
}

// Utils
function interpolate(
  object3D: THREE.Object3D,
  target: { position: THREE.Vector3; quaternion: THREE.Quaternion },
  onAnimate?: () => void
) {
  const duration = 500; // In milliseconds
  const fps = 30; // Frames per second
  const steps = Math.round(duration / (1000 / fps));
  const origin = {
    position: object3D.position.clone(),
    quaternion: object3D.quaternion.clone(),
  };
  const animationID = setInterval(animate, 1000 / fps);

  let step = 0;
  function animate() {
    step++;

    const t = step / steps;
    object3D.position.lerpVectors(origin.position, target.position, t);
    object3D.quaternion.slerpQuaternions(
      origin.quaternion,
      target.quaternion,
      t
    );

    if (onAnimate) onAnimate();

    if (step == steps) clearInterval(animationID);
  }
}
