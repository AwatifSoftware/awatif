import { app } from "awatif-ui";
import { calculateGlobalStiffnessMatrix } from 'awatif-fem/src/utils/plates/calculateGlobalStiffness';



app({ settings: { deformedShape: true } });


  
const stiffnessMatrix = calculateGlobalStiffnessMatrix();

console.log(stiffnessMatrix);



