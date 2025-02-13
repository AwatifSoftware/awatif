import van, { State } from "vanjs-core";
import { Node, Element } from "awatif-data-structure";
import triangle from "triangle-wasm";
// @ts-ignore
import triangleWasmUrl from "./assets/triangle.wasm?url";
import { subdivide } from "./subdivide";

// to make sure init is called once with multiple mesh call
const isWsLoaded = van.state(false);
triangle.init(triangleWasmUrl).then(() => (isWsLoaded.val = true));

export function mesh({
  points,
  polygon,
}: {
  points: State<number[][]>;
  polygon: State<number[]>;
}): {
  nodes: State<Node[]>; // the output are reactive just to react after wasm is loaded
  elements: State<Element[]>;
} {
  // init
  const nodes: State<Node[]> = van.state([]);
  const elements: State<Element[]> = van.state([]);

  // events: mesh when points and faces change
  van.derive(() => {
    if (!isWsLoaded.val) return;

    const input = triangle.makeIO({
      pointlist: points.val.flat(),
      // @ts-ignore
      segmentlist: polygonToSegments(polygon.val),
    });
    const output = triangle.makeIO();

    triangle.triangulate("pzQOS300q30a3", input, output);

    const { points: subPoints, faces: subFaces } = subdivide({
      points: triOutputToPoints(output),
      faces: triOutputToTriangles(output),
      subdivisions: 0,
    });

    nodes.val = subPoints.map((p) => [p[0], p[1], 0]);
    elements.val = subFaces;

    triangle.freeIO(input, true);
    triangle.freeIO(output);
  });

  return { nodes, elements };
}

// Utils
function polygonToSegments(polygon: number[]): number[] {
  const segments: number[] = [];

  for (let i = 0; i < polygon.length; i += 1) {
    segments.push(polygon[i], polygon[(i + 1) % polygon.length]);
  }

  return segments;
}

function triOutputToPoints(output: any): number[][] {
  const points = [];
  const outPoints = output.pointlist;

  for (let i = 0; i < outPoints.length; i += 2) {
    points.push([outPoints[i], outPoints[i + 1]]);
  }

  return points;
}

function triOutputToTriangles(output: any): number[][] {
  const triangles = [];
  const outTriangles = output.trianglelist;

  for (let i = 0; i < outTriangles.length; i += 3) {
    triangles.push([outTriangles[i], outTriangles[i + 1], outTriangles[i + 2]]);
  }

  return triangles;
}
