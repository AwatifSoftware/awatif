import van from "vanjs-core";
import * as THREE from "three";
import { sheets, viewer, layout, title, grid } from "awatif-ui";
import { timberColumnDesign } from "./timber-column-design";


// init
const globalInputs: any[][] = [
  ["pinned", 0.8, 1.3],
];

const slabInputs: any[][] = [
  [10, 10],
  [10, 20],
  [10, 30],
];

const designInputs: any[][] = [
  ["Col1", 4.2, 0.4, 0.4, 2000, 10, 15, 5, 5],
  ["Col2", 4.2, 0.5, 0.5, 3000, 20, 25, 15, 15],
  ["Col3", 4.2, 0.6, 0.6, 4000, 30, 35, 25, 25],
];

// Function Looping:
// const outputResults = designInputs.map((input) => Object.values(timberColumnDesign(globalInputs[0][0], 8000, 300, 100000, 1000,  5000, 4000, 24, 28, 34, 1200, 500, 0.9, 1.3)))
const outputResults = designInputs.map((input) => Object.values(timberColumnDesign(globalInputs[0][0], input[1]*1000, input[2], input[3], input[4],  input[5], input[6], input[7], input[8], input[9], input[10], input[11], globalInputs[0][1], globalInputs[0][2])))

const lines = new THREE.Line(
  new THREE.BufferGeometry(),
  new THREE.LineBasicMaterial()
);

const objects3D = van.state([lines]);
const sheetsObj = new Map();
const gridObj = {columns: [
  { field: "0", text: "λy" },
  { field: "1", text: "λz" },
  { field: "2", text: "ηy" },
  { field: "3", text: "ηz" },
  ], data: outputResults}



sheetsObj.set("globalParam", {
  text: ["Global Parameter"],
  data: globalInputs,
  columns: [
    { field: "0", text: "Support Type", editable: { type: "string" } },
    { field: "1", text: "kmod", editable: { type: "float" } },
    { field: "2", text: "gamma", editable: { type: "float" } },
  ],
});

sheetsObj.set("slabParam", {
  text: ["Slab Parameter"],
  data: slabInputs,
  columns: [
    { field: "0", text: "xCord", editable: { type: "int" } },
    { field: "1", text: "yCord", editable: { type: "int" } },
  ],
});

sheetsObj.set("columnParam", {
  text: ["Column Parameter"],
  data: designInputs,
  columns: [
    { field: "0", text: "Column", editable: { type: "string" } },
    { field: "1", text: "Length", editable: { type: "float" } },
    { field: "2", text: "Width", editable: { type: "float" } },
    { field: "3", text: "Height", editable: { type: "float" } },
    { field: "4", text: "Ned", editable: { type: "int" } },
    { field: "5", text: "Myd", editable: { type: "int" } },
    { field: "6", text: "Mzd", editable: { type: "int" } },
    { field: "7", text: "xCord", editable: { type: "int" } },
    { field: "8", text: "yCord", editable: { type: "int" } },
  ],
});


// events
const onSheetChange = ({ data }) => {
  lines.geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(data.flat(), 3)
  );

  objects3D.val = [...objects3D.rawVal]; // trigger rendering

};

onSheetChange({ data: designInputs }); // trigger the first render

document.body.append(
  layout({
    topLeft: title("Timber Column Designer"),
    main: sheets(sheetsObj, onSheetChange),
    preview: grid("designOutputs", gridObj.columns, gridObj.data),
    right: viewer({ objects3D }),
  })
);
