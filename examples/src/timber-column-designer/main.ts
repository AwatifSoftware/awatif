import van from "vanjs-core";
import * as THREE from "three";
import { sheets, viewer, layout, title, grid } from "awatif-ui";
import { timberColumnDesign } from "./timber-column-design";

// init
const designInputs: any[][] = [
  ["Col1", 4.2, 0.4, 0.4, 2000, 10, 15, 5, 5],
  ["Col2", 4.2, 0.5, 0.5, 3000, 20, 25, 15, 15],
  ["Col3", 4.2, 0.6, 0.6, 4000, 30, 35, 25, 25],
];

const designOutputs: any[][] = [
  ["Col1", 4.2, 0.4, 0.4, 2000, 10, 15, 5, 5],
  ["Col2", 4.2, 0.5, 0.5, 3000, 20, 25, 15, 15],
  ["Col3", 4.2, 0.6, 0.6, 4000, 30, 35, 25, 25],
];

// Function Looping:
const outputResults = designInputs.map((input) => Object.values(timberColumnDesign('pinned', 8000, 300, 100000, 1000,  5000, 4000, 24, 28, 34, 1200, 500, 0.9, 1.3)))

const lines = new THREE.Line(
  new THREE.BufferGeometry(),
  new THREE.LineBasicMaterial()
);

const objects3D = van.state([lines]);
const sheetsObj = new Map();
const gridObj = {columns: [
  { field: "0", text: "Column" },
  ], data: outputResults}

sheetsObj.set("polyline", {
  text: "Polyline",
  data: designInputs,
  columns: [
    { field: "0", text: "Column", editable: { type: "string" } },
    { field: "0", text: "Length", editable: { type: "float" } },
    { field: "1", text: "Width", editable: { type: "float" } },
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
