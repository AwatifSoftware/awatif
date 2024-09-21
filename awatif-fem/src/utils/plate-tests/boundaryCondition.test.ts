// tests/BoundaryCondition.test.ts

import { meshRectangularPlate } from "../meshRectanglularPlate";
import { boundaryCondition } from "../boundaryCondition";


describe("BoundaryCondition Function", () => {
  it("should correctly identify constrained DOFs for simply supported boundaries on a 2x2 mesh", () => {
    const L = 2;
    const B = 2;
    const Nx = 2;
    const Ny = 2;
    const loadstep = 1;

    const mesh = meshRectangularPlate(L, B, Nx, Ny);
    const typeBC = "ss-ss-ss-ss";
    const bcdof = boundaryCondition(typeBC, mesh.coordinates, loadstep);

    // Expected Constrained DOFs:
    // From L1 & L3: Nodes 0,1,2,6,7,8
    // L1 (0,1,2): DOFs [0,1], [3,4], [6,7]
    // L3 (6,7,8): DOFs [18,19], [21,22], [24,25]
    // L2 & L4: Nodes 0,1,2,3,5,6,8
    // L2 (1,2,5,8): DOFs [5,3], [8,6], [17,15], [26,24]
    // L4 (0,3,6): DOFs [2,0], [11,9], [20,18]
    const expectedDOFs = [
        0, 1, 2, 3, 4, 6, 7, 8, 9, 11, 15, 17, 18, 19, 20, 21, 22, 24, 25, 26,
    ].sort((a, b) => a - b);


    
    expect(bcdof).toEqual(expectedDOFs);
  });

  it("should correctly identify constrained DOFs for clamped boundaries on a 2x2 mesh", () => {
    const L = 2;
    const B = 2;
    const Nx = 2;
    const Ny = 2;
    const loadstep = 1;

    const mesh = meshRectangularPlate(L, B, Nx, Ny);
    const typeBC = "c-c-c-c";
    const bcdof = boundaryCondition(typeBC, mesh.coordinates, loadstep);

    // Expected Constrained DOFs:
    // From L1 & L3: Nodes 0,1,2,6,7,8
    // L1 (0,1,2): DOFs [2,0], [5,3], [8,6]
    // L3 (6,7,8): DOFs [20,18], [23,21], [26,24]
    // L2 & L4: Nodes 0,1,2,3,5,6,8
    // L2 (1,2,5,8): DOFs [4,3], [7,6], [16,15], [25,24]
    // L4 (0,3,6): DOFs [1,0], [10,9], [19,18]
    const expectedDOFs = [
        0, 1, 2, 3, 5, 6, 7, 8, 9, 10, 15, 16, 18, 19, 20, 21, 23, 24, 25, 26,
    ].sort((a, b) => a - b);
   

    expect(bcdof).toEqual(expectedDOFs);
  });

  it("should handle boundary conditions on a 1x1 mesh", () => {
    const L = 1;
    const B = 1;
    const Nx = 1;
    const Ny = 1;
    const loadstep = 1;

    const mesh = meshRectangularPlate(L, B, Nx, Ny);
    const typeBC_ss = "ss-ss-ss-ss";
    const bcdof_ss = boundaryCondition(typeBC_ss, mesh.coordinates, loadstep);

    const expectedDOFs_ss = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].sort(
      (a, b) => a - b
    );

    expect(bcdof_ss).toEqual(expectedDOFs_ss);

    const typeBC_c = "c-c-c-c";
    const bcdof_c = boundaryCondition(typeBC_c, mesh.coordinates, loadstep);

    const expectedDOFs_c = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].sort(
      (a, b) => a - b
    );

    expect(bcdof_c).toEqual(expectedDOFs_c);
  });

  it("should throw an error for unsupported boundary condition types", () => {
    const L = 2;
    const B = 2;
    const Nx = 2;
    const Ny = 2;
    const loadstep = 1;

    const mesh = meshRectangularPlate(L, B, Nx, Ny);
    const typeBC = "unsupported-type";

    expect(() => {
      boundaryCondition(typeBC, mesh.coordinates, loadstep);
    }).toThrow("Unsupported boundary condition type: unsupported-type");
  });
});

