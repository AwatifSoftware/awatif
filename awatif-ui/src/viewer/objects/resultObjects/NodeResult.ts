import * as THREE from "three";
import { IResultObject } from "./IResultObject";
import { Text } from "../Text";
import { Node } from "awatif-data-structure";
import { ResultType } from "../nodeResults";

export class NodeResult extends THREE.Group implements IResultObject {
  private xArrow?: THREE.ArrowHelper;
  private yArrow?: THREE.ArrowHelper;
  private zArrow?: THREE.ArrowHelper;
  private xText1?: Text;
  private xText2?: Text;
  private yText1?: Text;
  private yText2?: Text;
  private zText1?: Text;
  private zText2?: Text;

  constructor(
    node: Node,
    resultType: ResultType,
    result: [number, number, number, number, number, number]
  ) {
    super();
    // init
    const isR = resultType === ResultType.reactions;
    if (result[0])
      this.xText1 = new Text(`${isR ? "Fx" : "Dx"}: ` + result[0].toFixed(4));
    if (result[3])
      this.xText2 = new Text(`${isR ? "Mx" : "Rx"}: ` + result[3].toFixed(4));
    if (result[1])
      this.yText1 = new Text(`${isR ? "Fy" : "Dy"}: ` + result[1].toFixed(4));
    if (result[4])
      this.yText2 = new Text(`${isR ? "My" : "Ry"}: ` + result[4].toFixed(4));
    if (result[2])
      this.zText1 = new Text(`${isR ? "Fz" : "Dz"}: ` + result[2].toFixed(4));
    if (result[5])
      this.zText2 = new Text(`${isR ? "Mz" : "Rz"}: ` + result[5].toFixed(4));

    if (result[0] || result[3])
      this.xArrow = new THREE.ArrowHelper(
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(0, 0, 0),
        1,
        0xee9b00,
        0.3,
        0.3
      );
    if (result[1] || result[4])
      this.yArrow = new THREE.ArrowHelper(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, 0, 0),
        1,
        0xee9b00,
        0.3,
        0.3
      );
    if (result[2] || result[5])
      this.zArrow = new THREE.ArrowHelper(
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(0, 0, 0),
        1,
        0xee9b00,
        0.3,
        0.3
      );

    //update
    this.position.set(...node);

    if (this.xArrow) this.add(this.xArrow);
    if (this.yArrow) this.add(this.yArrow);
    if (this.zArrow) this.add(this.zArrow);
    if (this.xText1) this.add(this.xText1);
    if (this.xText2) this.add(this.xText2);
    if (this.yText1) this.add(this.yText1);
    if (this.yText2) this.add(this.yText2);
    if (this.zText1) this.add(this.zText1);
    if (this.zText2) this.add(this.zText2);
  }

  updateScale(scale: number): void {
    this.xArrow?.scale.set(scale, scale, scale);
    this.yArrow?.scale.set(scale, scale, scale);
    this.zArrow?.scale.set(scale, scale, scale);

    this.xText1?.position.set(1.3 * scale, 0, 0);
    this.xText2?.position.set(1.3 * scale, 0, 0.5 * scale);
    this.yText1?.position.set(0, 1.3 * scale, 0);
    this.yText2?.position.set(0, 1.3 * scale, 0.5 * scale);
    this.zText1?.position.set(0, 0, 1.3 * scale);
    this.zText2?.position.set(0, 0, 1.3 * scale + 0.5 * scale);

    this.xText1?.updateScale(0.4 * scale);
    this.xText2?.updateScale(0.4 * scale);
    this.yText1?.updateScale(0.4 * scale);
    this.yText2?.updateScale(0.4 * scale);
    this.zText1?.updateScale(0.4 * scale);
    this.zText2?.updateScale(0.4 * scale);
  }

  dispose(): void {
    this.xArrow?.dispose();
    this.yArrow?.dispose();
    this.zArrow?.dispose();
    this.xText1?.dispose();
    this.xText2?.dispose();
    this.yText1?.dispose();
    this.yText2?.dispose();
    this.zText1?.dispose();
    this.zText2?.dispose();
  }
}
