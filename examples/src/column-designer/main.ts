import van, { State } from "vanjs-core";
import { Text } from "awatif-ui/src/viewer/objects/Text";
import * as THREE from "three";
import { sheets, viewer, layout, title, grid, marketing } from "awatif-ui";
import { html, TemplateResult } from "lit-html";
import { timberColumnDesign, SupportType } from "./timber-column-designer";
import { getKmod, getGlulamProperties } from "./utils";
import { renderMath, toggleView } from "./reportUtils";

import logo from "./awatif-logo.jpg";

// init
const designInputs = van.state([
  ["Col1", 4.2, 0.4, 0.4, 2000, 10, 15, 1.0, 1.0],
  ["Col2", 4.2, 0.5, 0.5, 3000, 20, 25, 1.0, 8.25],
  ["Col3", 4.2, 0.5, 0.5, 3000, 30, 35, 1.0, 16],
  ["Col4", 4.2, 0.5, 0.5, 3000, 30, 35, 8.25, 1.0],
  ["Col5", 4.2, 0.4, 0.4, 2000, 30, 35, 16, 1.0],
  ["Col6", 4.2, 0.4, 0.4, 2000, 30, 35, 16, 16],
  ["Col7", 4.2, 0.5, 0.5, 3000, 30, 35, 16, 8.25],
  ["Col8", 4.2, 0.5, 0.5, 3000, 30, 35, 8.25, 16],
  ["Col9", 4.2, 0.6, 0.6, 5000, 0, 0, 8.25, 8.25],
]);

const slabInputs = van.state([
  [0.5, 0.5, 0],
  [16.5, 0.5, 0],
  [16.5, 16.5, 0],
  [0.5, 16.5, 0],
  [0.5, 0.5, 0],
]);

const globalInputs = van.state([
  ["pinned", 2, "long-term", "GL28h"]]);

const designResults = van.state([]);
const lines = new THREE.Line(
  new THREE.BufferGeometry(),
  new THREE.LineBasicMaterial()
);

const points = new THREE.Points(
  new THREE.BufferGeometry(),
  new THREE.PointsMaterial({})
);

var text = new Text("Hello World")
text.position.set(5,5,0)

const objects3D = van.state([lines, points, text]);
const sheetsObj = new Map();

// global inputs
sheetsObj.set("global-Param", {
  text: "Global",
  size: '8px',
  fields: [
    { field: "A", text: "Support", editable: { type: "string" } },
    { field: "B", text: "serviceClass", editable: { type: "number" } },
    { field: "C", text: "loadDurationClass", editable: { type: "string" } },
    { field: "D", text: "Grade", editable: { type: "string" } },
  ],
  data: globalInputs,
});
console.log(globalInputs)

// global inputs
sheetsObj.set("slab-Inputs", {
  text: "Slab",
  fields: [
    { field: "A", text: "xCord", editable: { type: "int" } },
    { field: "B", text: "yCord", editable: { type: "int" } },
  ],
  data: slabInputs,
});

// design inputs
sheetsObj.set("design-Inputs", {
  text: "Columns",
  fields: [
    { field: "A", text: "Column", editable: { type: "string" } },
    { field: "B", text: "Length", editable: { type: "float" } },
    { field: "C", text: "Width", editable: { type: "float" } },
    { field: "D", text: "Height", editable: { type: "float" } },
    { field: "E", text: "Ned", editable: { type: "int" } },
    { field: "F", text: "Myd", editable: { type: "int" } },
    { field: "G", text: "Mzd", editable: { type: "int" } },
    { field: "H", text: "xCord", editable: { type: "float" } },
    { field: "I", text: "yCord", editable: { type: "float" } },
  ],
  data: designInputs,
});


// events
const onSheetChange = ({ data, sheet }) => {
  console.log(`Data updated on sheet: ${sheet}`);
  if (sheet == "design-Inputs") {
      var changedData = designInputs
  } else if (sheet == "slab-Inputs") {
      changedData = slabInputs
  } else {
      changedData = globalInputs
  }
  changedData.val = data; // Update the reactive state with new sheet data
};

const noCols = designInputs.val.length
const colNames = [];
for (let i = 0; i < noCols; i++) {
  colNames.push(designInputs.val[i][0])
}


van.derive(() => {

  const results = [];
  for (let i = 0; i < noCols; i++) {

    var column = designInputs.val[i][0] as string
    var support = globalInputs.val[0][0] as SupportType
    var length = designInputs.val[i][1] as number
    var width = designInputs.val[i][2] as number
    var height = designInputs.val[i][3] as number
    var N_ed = designInputs.val[i][4] as number
    var M_yd = designInputs.val[i][5] as number
    var M_zd = designInputs.val[i][6] as number
    var grade = globalInputs.val[0][3] as string
    var E_modulus = 9500
    var G_05 = 720
    const { kMod, gamma, chi } = getKmod(2, "short-term");
    const glulam = getGlulamProperties(grade);

    const outputResults = timberColumnDesign(column, support, length, width, height, N_ed, M_yd, M_zd, glulam, chi)
    results.push(outputResults);
  }
  designResults.val = results;
});


// on inputPolyline change: render lines
var xyCoords = [];
for (let i = 0; i < noCols; i++) {
  const xCord = designInputs.val[i][7] as number; // x-coordinate
  const yCord = designInputs.val[i][8] as number; // y-coordinate
  const zCord = 0; // z-coordinate

  xyCoords.push([xCord, yCord, zCord]); // Push coordinates as an array
}

van.derive(() => {

  //lines
  lines.geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(slabInputs.val.flat(), 3)
  );
  lines.material.color.set(0x132e39); // Green lines

  //points
  const positions = xyCoords.flat();
  points.geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  points.material.size = 1; // Larger points
  points.material.color.set(0xff0000); // Red points

  //text
  // Clear existing text objects
  const currentTexts = objects3D.rawVal.filter(obj => obj instanceof Text);
  currentTexts.forEach(textObj => objects3D.rawVal.splice(objects3D.rawVal.indexOf(textObj), 1));

  // Add new text objects dynamically
  for (let i = 0; i < noCols; i++) {
    const xCord = designInputs.val[i][7] as number;
    const yCord = designInputs.val[i][8] as number;
    const zCord = 2;

    // Multi-line text content
    const lines = [
      `Col${i + 1}`,
      `η: ${designResults.val[i][1]*100}%`,
    ];

    lines.forEach((line, index) => {
      const lineText = new Text(line);
      lineText.updateScale(0.7)
      lineText.position.set(xCord, yCord, zCord- index * 0.7); // Adjust yCord for each line
      objects3D.rawVal.push(lineText); // Add to objects
    });
  }

  // surface
  // Clear previous surfaces
  const currentSurfaces = objects3D.rawVal.filter(obj => obj instanceof THREE.Mesh);
  currentSurfaces.forEach(surface => {
    surface.geometry.dispose(); // Dispose of geometry
    surface.material.dispose(); // Dispose of material
    objects3D.rawVal.splice(objects3D.rawVal.indexOf(surface), 1);
  });

  // Create and add the new surface
  const vertices = slabInputs.val.flat();
  const indices = [0, 1, 2, 0, 2, 3]; // Indices defining triangles
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);

  geometry.computeVertexNormals();

  const material = new THREE.MeshBasicMaterial({
    color: 0x132e39, // The color you want to use
    side: THREE.DoubleSide, // Make both sides of the object visible
  });

  const surface = new THREE.Mesh(geometry, material);
  objects3D.rawVal.push(surface);

  objects3D.val = [...objects3D.rawVal]; // trigger rendering
});


document.body.append(
  layout({
    topLeft: { element: title("Timber Column Designer") },
    topRight: {
      element: marketing({
        getStarted: getGetStartedHtml(),
        author: getAuthorHtml(),
        report: getReport(designInputs, designResults),
      }),
    },
    main: {
      element: sheets({ sheets: sheetsObj, onChange: onSheetChange }),
      title: "Inputs",
    },
    preview: {
      element: grid({
        fields: [
          { field: "A", text: "Column"},
          { field: "B", text: "ηy"},
          { field: "C", text: "ηz"},
          { field: "D", text: "λy"},
          { field: "E", text: "λz"},
        ],
        data: designResults
      }),
      title: "Outputs",
    },
    right: { element: viewer({ objects3D }) },
  }),
);


function getGetStartedHtml(): TemplateResult {
  return html`<p>In this video you will learn why we build this platform:</p>
    <iframe
      width="560"
      height="315"
      src="https://www.youtube.com/embed/hHQiSyCfIeA?si=tD5DmVvki1uJxU4i"
      title="YouTube video player"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin"
      allowfullscreen
    ></iframe>`;
}

function getAuthorHtml(): TemplateResult {
  return html`<p style="line-height: 1.6">
      Hi, I'm Cal Mense, a passionate structural engineer and software
      developer based in Amsterdam, with extensive experience in both fields.
      While working on the design of high-rise buildings, I realized that the
      structural design process was inefficient, leading to wasted time and
      materials. This inspired me to focus on solving these challenges,
      resulting in the creation of Awatif, an open-source, web-based platform
      built with modern optimization and programming techniques to streamline
      structural design.
    </p>

    <p>
      If you'd like to chat about structural engineering, software development,
      or anything else, feel free to connect with me on LinkedIn:
      <a href="https://www.linkedin.com/in/madil4/" target="_blank"
        >https://www.linkedin.com/in/madil4/</a
      >
    </p>

    <img
      width="200"
      height="200"
      src="https://awatif.co/img/services/mohamed.jpg"
    /> `;
}


function getReport(designInputs, designResults): TemplateResult {

  var i = 0
  console.log(designInputs)

  var column = designInputs.val[i][0] as string
  var support = globalInputs.val[0][0] as SupportType
  var length = designInputs.val[i][1] as number
  var width = designInputs.val[i][2] as number
  var height = designInputs.val[i][3] as number
  var N_ed = designInputs.val[i][4] as number
  var M_yd = designInputs.val[i][5] as number
  var M_zd = designInputs.val[i][6] as number
  var grade = globalInputs.val[0][3] as string
  var E_modulus = 9500
  var G_05 = 720
  const { kMod, gamma, chi } = getKmod(2, "short-term");
  const glulam = getGlulamProperties(grade);

  const index = Array.from({ length: noCols }, (_, i) => i);


  return html`

  <header class="header">
      <div class="header-left">
        <h6>Timber Column Designer</h6>
        <p class="bolt">Awatif.co</p>
        <p class="normal">20.12.2024</p>
      </div>
      <div class="header-right">
        <img src=${logo} id="headerLogo" height="60px" />
      </div>
    </header>

    <br>
    <h2>Summary</h2>
    <br>

    <table id="data-table">
      <tr>

        <th>Column</th>
        <th>Length</th>
        <th>Width</th>
        <th>Height</th>
        <th>Grade</th>
        <th>Ned</th>
        <th>Myd</th>
        <th>Mzd</th>
        <th>Util Y</th>
        <th>Util Z</th>

      </tr>
      ${index.map(
        (i) => html`
          <tr>

          <td><div class="custom-cell-content">${designInputs.val[i][0]}</div></td>
          <td><div class="custom-cell-content">${designInputs.val[i][1]}</div></td>
          <td><div class="custom-cell-content">${designInputs.val[i][2]}</div></td>
          <td><div class="custom-cell-content">${designInputs.val[i][3]}</div></td>
          <td><div class="custom-cell-content">${globalInputs.val[0][3]}</div></td>
          <td><div class="custom-cell-content">${designInputs.val[i][4]}</div></td>
          <td><div class="custom-cell-content">${designInputs.val[i][5]}</div></td>
          <td><div class="custom-cell-content">${designInputs.val[i][6]}</div></td>
          <td><div class="custom-cell-content">${designResults.val[i][1]}</div></td>
          <td><div class="custom-cell-content">${designResults.val[i][2]}</div></td>

          </tr>
        `
      )}
    </table>

  <br>
  <br>
  <h2>Input Values</h2>

  <h3>System</h3>
  <p class="p1">Column: ${column}</p>
  <p class="p1">Grade: ${grade}</p>
  <p class="p1">Support: ${support}</p>

  <h3>Geometry</h3>
  <p class="p1">Length: ${length} m</p>
  <p class="p1">Width: ${width} m</p>
  <p class="p1">Height: ${height} m</p>

  <br>
  <h2>Design Loading</h2>
  <p class="math">${renderMath(`N_{ed} = ${N_ed} kN`)}</p>

  <br>
  <h2>Material Resistance</h2>

  <br>
  <h2>Bending</h2>
  <p class="p1">EN 1995-1-1 Ch. 6.3.2</p>
  <p class="p1">y-Axis</p>
  <p class="p1">z-Axis</p>


  <h2>Checks</h2>
  <p class="p1">EN 1995-1-1 Ch. 6.3.2</p>
  <p class="p1">y-Axis</p>
  <p class="p1">z-Axis</p>



  `
}