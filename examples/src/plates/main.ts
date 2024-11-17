import van, { State } from "vanjs-core";
import { Node, Element, AnalysisOutputs } from "awatif-data-structure";
import { Parameters, parameters, viewer } from "awatif-ui";

import { calculateGlobalStiffnessMatrix } from "awatif-fem/src/utils/plates/calculateGlobalStiffness";
import { meshRectangularPlate } from "awatif-fem/src/utils/plates/meshRectanglularPlate";
import { boundaryCondition } from "awatif-fem/src/utils/plates/boundaryCondition";
import { applyConstraints } from "awatif-fem/src/utils/plates/applyConstraints";
import { solveDisplacement } from "awatif-fem/src/utils/plates/solveDisplacement";

// visualize basic 2D mesh
const nodes: State<Node[]> = van.state([]);
const elements: State<Element[]> = van.state([]);
const analysisOutputs: State<AnalysisOutputs> = van.state({});

// define the parameters
const params: Parameters = {
  width: { value: van.state(10), min: 0, max: 25 },
  breath: { value: van.state(5), min: 0, max: 25 },
  load: { value: van.state(0), min: 0, max: 500 },
};

// visualize the rectangular mesh
van.derive(() => {
  const a = params.width.value.val; // Length along X-axis
  const b = params.breath.value.val; // Breadth along Y-axis
  const E = 10920; // Elastic modulus
  const nu = 0.3; // Poisson's ratio
  const t = 0.1; // Plate thickness
  const Nx = 5;
  const Ny = 5;
  const {
    coordinates: quadNodes,
    elements: quadElements,
    nel,
    nnode,
  } = meshRectangularPlate(a, b, Nx, Ny);

  nodes.val = quadNodes;
  elements.val = quadElements;

  // compute the new displacement
  // stiffnesses and forces
  const { stiffness, force } = calculateGlobalStiffnessMatrix(
    quadNodes,
    quadElements,
    nel,
    nnode,
    E,
    nu,
    t
  );

  // supports
  const typeBC = "ss-ss-ss-ss";
  const loadStep = 1;
  const constrainedDOFs = boundaryCondition(typeBC, quadNodes, loadStep);

  // Apply constraints
  applyConstraints(stiffness, force, constrainedDOFs);

  // Solve for displacement
  analysisOutputs.val = solveDisplacement(stiffness, force, nnode);
});

document.body.append(
  parameters(params),
  viewer({
    structure: {
      nodes,
      elements,
      analysisOutputs,
    },
  })
);
