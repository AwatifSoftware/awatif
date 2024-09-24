import { app } from "awatif-ui";
import { calculateGlobalStiffnessMatrix } from 'awatif-fem/src/utils/calculateGlobalStiffness';



app({ settings: { deformedShape: true } });


  
const stiffnessMatrix = calculateGlobalStiffnessMatrix();

console.log(stiffnessMatrix);