import { create, all, MathJsStatic } from 'mathjs';
import { AnalysisOutputs, NodeAnalysisOutputs } from 'awatif-data-structure';

// Initialize MathJS
const math: MathJsStatic = create(all);


export function solveDisplacement(stiffness: math.Matrix, force: number[], nnodes: number): AnalysisOutputs {
  // Solve the system of equations stiffness * displacement = force
  const displacement = math.lusolve(stiffness, math.matrix(force));

   // Convert displacement to a flat array
   const displacementArray = displacement.valueOf() as number[][];
   const flattenedDisplacements = displacementArray.map(row => row[0]);

  // Map displacements to nodes
  const nodesOutputMap = new Map<number, NodeAnalysisOutputs>()

  const ndof = 3; // Degrees of freedom per node
 

  for (let i = 0; i < nnodes; i++) {
    const dofStartIndex = i * ndof;

  // Extract the first three displacement values for the node
    const deformationValues = [
      0,
      0,
      flattenedDisplacements[dofStartIndex] ?? 0,
      flattenedDisplacements[dofStartIndex + 1] ?? 0,
      flattenedDisplacements[dofStartIndex + 2] ?? 0,
      0,
    ] as [number, number, number, number, number, number];

    
    // Create the NodeAnalysisOutputs object
      const nodeOutput: NodeAnalysisOutputs = {
        deformation: deformationValues,
      
      };
  
      // Add to the nodes map
      nodesOutputMap.set(i, nodeOutput);

  }

    // Assemble the AnalysisOutputs object
    const analysisOutputs: AnalysisOutputs = {
      nodes: nodesOutputMap,
      
    };

    console.log("test");
  

    return analysisOutputs;


}


