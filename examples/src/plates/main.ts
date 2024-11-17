
import { app } from "awatif-ui";
import { calculateGlobalStiffnessMatrix } from 'awatif-fem/src/utils/plates/calculateGlobalStiffness';
import { meshRectangularPlate } from "awatif-fem/src/utils/plates/meshRectanglularPlate";
import { boundaryCondition } from "awatif-fem/src/utils/plates/boundaryCondition"
import {applyConstraints} from "awatif-fem/src/utils/plates/applyConstraints"
import {solveDisplacement} from "awatif-fem/src/utils/plates/solveDisplacement"



app({ settings: { deformedShape: true } });


// Geometrical and material properties of plate
const a = 1; // Length along X-axis
const b = 1; // Breadth along Y-axis
const E = 10920; // Elastic modulus
const nu = 0.3;  // Poisson's ratio
const t = 0.1;   // Plate thickness
// Number of mesh elements in x and y directions
const Nx = 2;
const Ny = 2;




const { coordinates, elements, nel, nnode } = meshRectangularPlate(a, b, Nx, Ny);


// Call the refactored calculateGlobalStiffnessMatrix function
let result = calculateGlobalStiffnessMatrix(
    coordinates,
    elements,
    nel,
    nnode,
    E,
    nu,
    t
  );
  
  // Access the global stiffness matrix and force vector
//   console.log('Global Stiffness Matrix:', result.stiffness.toString());
//   console.log('Global Force Vector:', result.force);


const typeBC = 'ss-ss-ss-ss';
const loadStep = 1;

const constrainedDOFs = boundaryCondition(typeBC, coordinates, loadStep);
console.log('Constrained boundaries:', constrainedDOFs);




console.log("Initial Stiffness Matrix:");
console.log(result.stiffness.toString()); // Print initial stiffness matrix

console.log("Initial Force Vector:");
console.log(result.force); // Print initial force vector

// Apply constraints
applyConstraints(result.stiffness, result.force, constrainedDOFs);

console.log("Modified Stiffness Matrix:");
console.log(result.stiffness.toString()); // Print modified stiffness matrix

console.log("Modified Force Vector:");
console.log(result.force); // Print modified force vector


  // Solve for displacement
  const displacement = solveDisplacement(result.stiffness, result.force, nnode);

  console.log('Displacement Vector:');
  console.log(displacement.toString()); // Print the displacement vector