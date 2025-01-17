import * as THREE from "three";
import van from "vanjs-core";
import { Drawing } from "../drawing";

export function animateGrid({
  gridTarget,
  gridObj,
  viewerRender,
}: {
  gridObj: THREE.GridHelper;
  gridTarget: Drawing["gridTarget"];
  viewerRender: () => void;
}) {
  van.derive(() => {
    animateObject(
      gridObj,
      {
        position: new THREE.Vector3(...gridTarget.val.position),
        quaternion: new THREE.Quaternion().setFromEuler(
          new THREE.Euler(...gridTarget.val.rotation)
        ),
      },
      viewerRender
    );
  });
}

// Utils
function animateObject(
  object3D: THREE.Object3D,
  target: { position: THREE.Vector3; quaternion: THREE.Quaternion },
  onAnimate: () => void
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

    onAnimate();

    if (step == steps) clearInterval(animationID);
  }
}
