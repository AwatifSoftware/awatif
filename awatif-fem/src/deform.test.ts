import {
  Node,
  Element,
  NodeInputs,
  ElementInputs,
} from "awatif-data-structure";
import { deform } from "./deform";

describe("deform", () => {
  test("3D bars from Logan's book example 3.9", () => {
    const nodes: Node[] = [
      [12, -3, -4],
      [0, 0, 0],
      [12, -3, -7],
      [14, 6, 0],
    ];
    const elements: Element[] = [
      [1, 0],
      [2, 0],
      [3, 0],
    ];
    const nodeInputs: NodeInputs = {
      supports: new Map(),
      loads: new Map(),
    };
    const elementInputs: ElementInputs = {
      elasticities: new Map(),
      areas: new Map(),
    };

    nodeInputs.supports?.set(1, [true, true, true, false, false, false]);
    nodeInputs.supports?.set(2, [true, true, true, false, false, false]);
    nodeInputs.supports?.set(3, [true, true, true, false, false, false]);
    nodeInputs.loads?.set(0, [20, 0, 0, 0, 0, 0]);

    elements.forEach((_, i) => {
      elementInputs.elasticities?.set(i, 210e6);
      elementInputs.areas?.set(i, 10e-4);
    });

    const deformOutputs = deform(nodes, elements, nodeInputs, elementInputs);

    expect(deformOutputs).toEqual({
      deformations: new Map([
        [
          0,
          [
            0.001383724933236592, -0.00005156643246716525,
            0.00006015037593984962, 0, 0, 0,
          ],
        ],
        [1, [0, 0, 0, 0, 0, 0]],
        [2, [0, 0, 0, 0, 0, 0]],
        [3, [0, 0, 0, 0, 0, 0]],
      ]),
      reactions: new Map([
        [
          1,
          [-18.947368421052634, 4.736842105263158, 6.3157894736842115, 0, 0, 0],
        ],
        [2, [0, 0, -4.2105263157894735, 0, 0, 0]],
        [
          3,
          [
            -1.0526315789473686, -4.7368421052631575, -2.105263157894737, 0, 0,
            0,
          ],
        ],
      ]),
    });
  });

  test("3D frames from Logan's book example 5.8", () => {
    const nodes: Node[] = [
      [2.5, 0, 0],
      [0, 0, 0],
      [2.5, 0, -2.5],
      [2.5, -2.5, 0],
    ];
    const elements: Element[] = [
      [1, 0],
      [2, 0],
      [3, 0],
    ];
    const nodeInputs: NodeInputs = {
      supports: new Map(),
      loads: new Map(),
    };
    const elementInputs: ElementInputs = {
      elasticities: new Map(),
      shearModuli: new Map(),
      torsionalConstants: new Map(),
      areas: new Map(),
      momentsOfInertiaY: new Map(),
      momentsOfInertiaZ: new Map(),
    };

    nodeInputs.supports?.set(1, [true, true, true, true, true, true]);
    nodeInputs.supports?.set(2, [true, true, true, true, true, true]);
    nodeInputs.supports?.set(3, [true, true, true, true, true, true]);
    nodeInputs.loads?.set(0, [0, -200e3, 0, -100e3, 0, 0]);
    elements.forEach((_, i) => {
      elementInputs.elasticities?.set(i, 200e9);
      elementInputs.shearModuli?.set(i, 60e9);
      elementInputs.momentsOfInertiaZ?.set(i, 40e-6);
      elementInputs.momentsOfInertiaY?.set(i, 40e-6);
      elementInputs.torsionalConstants?.set(i, 20e-6);
      elementInputs.areas?.set(i, 6.25e-3);
    });

    const deformOutputs = deform(nodes, elements, nodeInputs, elementInputs);

    expect(deformOutputs).toEqual({
      deformations: new Map([
        [
          0,
          [
            0.0000017466534414748466, -0.0003356441727126348,
            -0.00005650787769304768, -0.003752156183061716,
            0.000017154708554951422, -0.00009935435371409363,
          ],
        ],
        [1, [0, 0, 0, 0, 0, 0]],
        [2, [0, 0, 0, 0, 0, 0]],
        [3, [0, 0, 0, 0, 0, 0]],
      ]),
      reactions: new Map([
        [
          1,
          [
            -873.3267207374233, 1299.1563606221894, 215.43623884405804,
            1801.0349678696236, -324.19036593091715, 1941.8793826628362,
          ],
        ],
        [
          2,
          [
            121.0167229576055, 30878.75728306041, 28253.93884652384,
            -26591.54681802802, 96.37583632116228, 47.69008978276494,
          ],
        ],
        [
          3,
          [
            752.3099977798178, 167822.0863563174, -28469.375085367898,
            -23579.819070912377, -8.234260106376682, -622.4535653396724,
          ],
        ],
      ]),
    });
  });
});
