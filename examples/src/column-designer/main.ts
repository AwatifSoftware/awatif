import van from "vanjs-core";
import * as THREE from "three";
import { sheets, viewer, layout, title, grid, marketing } from "awatif-ui";
import { html, TemplateResult } from "lit-html";
import { timberColumnDesign, SupportType } from "./timber-column-designer";


// init
const designInputs = van.state([
  ["Col1", 4.2, 0.4, 0.4, 2000, 10, 15, 5, 5],
  ["Col2", 4.2, 0.5, 0.5, 3000, 20, 25, 15, 15],
  ["Col3", 4.2, 0.6, 0.6, 4000, 30, 35, 25, 25],
]);

const slabInputs = van.state([
  [10, 10],
  [10, 20],
  [10, 30],
]);

const globalInputs = van.state([
  ["pinned", 0.8, 1.3, "GL28h"]]);

const designResults = van.state([]);
const lines = new THREE.Line(
  new THREE.BufferGeometry(),
  new THREE.LineBasicMaterial()
);
const objects3D = van.state([lines]);
const sheetsObj = new Map();

// global inputs
sheetsObj.set("global-Param", {
  text: "Global",
  fields: [
    { field: "A", text: "Support", editable: { type: "string" } },
    { field: "B", text: "kmod", editable: { type: "float" } },
    { field: "C", text: "gamma", editable: { type: "float" } },
    { field: "D", text: "Grade", editable: { type: "float" } },

  ],
  data: globalInputs,
});

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
    { field: "H", text: "xCord", editable: { type: "int" } },
    { field: "I", text: "yCord", editable: { type: "int" } },
  ],
  data: designInputs,
});

// events
const onSheetChange = ({ data }) => (designInputs.val = data);
const noCols = designInputs.val.length

van.derive(() => {

  const results = [];
  for (let i = 0; i < noCols; i++) {

    var support = globalInputs.val[0][0] as SupportType
    var length = designInputs.val[i][1] as number
    var width = designInputs.val[i][2] as number
    var height = designInputs.val[i][3] as number
    var N_ed = designInputs.val[i][4] as number
    var M_yd = designInputs.val[i][5] as number
    var M_zd = designInputs.val[i][6] as number
    var f_c0k = 28
    var f_myk = 28
    var f_mzk = 28
    var E_modulus = 9500
    var G_05 = 720
    var k_mod = globalInputs.val[0][1] as number
    var gamma = globalInputs.val[0][2] as number

    const outputResults = timberColumnDesign(support, length, width, height, N_ed, M_yd, M_zd, f_c0k, f_myk, f_mzk, E_modulus, G_05, k_mod, gamma)
    results.push(outputResults);
  }
  designResults.val = results;

});

document.body.append(
  layout({
    topLeft: { element: title("Timber Column Designer") },
    topRight: {
      element: marketing({
        getStarted: getGetStartedHtml(),
        author: getAuthorHtml(),
      }),
    },
    main: {
      element: sheets({ sheets: sheetsObj, onChange: onSheetChange }),
      title: "Inputs",
    },
    preview: {
      element: grid({
        fields: [
          { field: "A", text: "λy"},
          { field: "B", text: "λz"},
          { field: "C", text: "ηy"},
          { field: "D", text: "ηz"},
        ],
        data: designResults,
      }),
      title: "Outputs",
    },
    right: { element: viewer({ objects3D }) },
  })
);

// Utils
function getLength(point1: number[], point2: number[]): number {
  return Math.sqrt(
    Math.pow(point2[0] - point1[0], 2) +
      Math.pow(point2[1] - point1[1], 2) +
      Math.pow(point2[2] - point1[2], 2)
  );
}

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
      Hi, I'm Mohamed Adil, a passionate structural engineer and software
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
