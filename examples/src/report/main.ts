import { Node, Element, AnalyzeOutputs, DeformOutputs, ElementInputs, NodeInputs, Structure } from "awatif-data-structure";
import { deform, analyze } from "awatif-fem";
import { html, TemplateResult } from "lit-html";
import van from "vanjs-core";
import { State } from "vanjs-core/debug";
import { Parameters, parameters, viewer } from "awatif-ui";

//const nodes = van.state([0, 0, 1]);
//@ts-ignorets-ignore
import logo from "./awatif-logo.jpg";

//bars
// Init
const params: Parameters = {
  xPosition: { value: van.state(600), min: 0, max: 1000 },
  zPosition: { value: van.state(0), min: 0, max: 500 },
};

const nodes: State<Node[]> = van.state([]);
const elements: State<Element[]> = van.state([]);
const nodeInputs: State<NodeInputs> = van.state({});
const elementInputs: State<ElementInputs> = van.state({});
const deformOutputs: State<DeformOutputs> = van.state({});
const analyzeOutputs: State<AnalyzeOutputs> = van.state({});

// Events: on parameter change
van.derive(() => {
  nodes.val = [
    [250, 0, 0],
    [params.xPosition.value.val, 0, params.zPosition.value.val],
    [250, 0, 400],
  ];
  elements.val = [
    [0, 1],
    [1, 2],
  ];

  nodeInputs.val = {
    supports: new Map([
      [0, [true, true, true, true, true, true]],
      [2, [true, true, true, true, true, true]],
    ]),
    loads: new Map([[1, [0, 0, -1e3, 0, 0, 0]]]),
  };

  elementInputs.val = {
    elasticities: new Map([
      [0, 200],
      [1, 200],
    ]),
    areas: new Map([
      [0, 100],
      [1, 100],
    ]),
  };

  deformOutputs.val = deform(
    nodes.val,
    elements.val,
    nodeInputs.val,
    elementInputs.val
  );

  analyzeOutputs.val = analyze(
    nodes.val,
    elements.val,
    elementInputs.val,
    deformOutputs.val
  );
});

const nodeIDsArray = [...nodeInputs.val.supports.keys()];

const noNodes = nodes.val.length
const indexNodes = Array.from({ length: noNodes }, (_, i) => i);

const noBars = elements.val.length
const indexBars = Array.from({ length: noBars }, (_, i) => i);




const template: (nodes: Structure["nodes"]) => TemplateResult = (nodes) => {
  return html`
  <br>
  <header class="header">
    <div class="header-left">
      <h6>Report</h6>
      <p class="bolt">
        <a href="https://awatif.co" target="_blank" rel="noopener noreferrer">Awatif.co</a>
      </p>
      <p class="normal" id="reportDate"></p> <!-- Dynamic Date -->
    </div>
    <div class="header-right">
      <img src=${logo} id="headerLogo" height="60px" />
    </div>
  </header>

    <br>
    <h1>Bars</h1>

    <br>
    <h2>Nodes</h2>
    <p class="text">The following table gives an overview of the node coordinates.</p>
    <br>

    <!-- Table Section -->
    <table id="data-table">
      <tr>
        <th>Node</th>
        <th>xCoord</th>
        <th>yCoord</th>
        <th>zCoord</th>
      </tr>
      ${indexNodes.map(
        (iNodes) => html`
          <tr>
          <td><div class="custom-cell-content">${iNodes}</div></td>
          <td><div class="custom-cell-content">${nodes.val[iNodes][0]}</div></td>
          <td><div class="custom-cell-content">${nodes.val[iNodes][1]}</div></td>
          <td><div class="custom-cell-content">${nodes.val[iNodes][2]}</div></td>
      </tr>
        `
      )}
    </table>

    <br>
    <h2>Supports</h2>
    <p class="text">The following table gives an overview of the support conditions.</p>
    <br>

    <!-- Table Section -->
    <table id="data-table">
      <tr>
        <th>Node</th>
        <th>ux</th>
        <th>uy</th>
        <th>uz</th>
        <th>mx</th>
        <th>my</th>
        <th>mz</th>
      </tr>
      ${nodeIDsArray.map(
        
        (iBars) => html`
      <tr>
          <td><div class="custom-cell-content">${iBars}</div></td>
          <td><div class="custom-cell-content">${nodeInputs.val.supports.get(iBars)[0]}</div></td>
          <td><div class="custom-cell-content">${nodeInputs.val.supports.get(iBars)[1]}</div></td>
          <td><div class="custom-cell-content">${nodeInputs.val.supports.get(iBars)[2]}</div></td>
          <td><div class="custom-cell-content">${nodeInputs.val.supports.get(iBars)[3]}</div></td>
          <td><div class="custom-cell-content">${nodeInputs.val.supports.get(iBars)[4]}</div></td>
          <td><div class="custom-cell-content">${nodeInputs.val.supports.get(iBars)[5]}</div></td>
     </tr>
        `
      )}
    </table>

    <br>
    <h2>Reactions</h2>
    <p class="text">The following table gives an overview of the reaction forces.</p>
    <br>

    <!-- Table Section -->
    <table id="data-table">
      <tr>
        <th>Node</th>
        <th>Fx</th>
        <th>Fy</th>
        <th>Fz</th>
      </tr>
      ${nodeIDsArray.map(
        
        (iBars) => html`
      <tr>
          <td><div class="custom-cell-content">${iBars}</div></td>
          <td><div class="custom-cell-content">${deformOutputs.val.reactions.get(iBars)[0].toFixed(0)}</div></td>
          <td><div class="custom-cell-content">${deformOutputs.val.reactions.get(iBars)[1].toFixed(0)}</div></td>
          <td><div class="custom-cell-content">${deformOutputs.val.reactions.get(iBars)[2].toFixed(0)}</div></td>
     </tr>
        `
      )}
    </table>

    <br>
    <h2>Elements</h2>
    <p class="text">The following table gives an overview of the element results.</p>
    <br>

    <!-- Table Section -->
    <table id="data-table">
      <tr>
        <th>Bar</th>
        <th>Area</th>
        <th>Normal</th>
      </tr>
      ${indexBars.map(
        (iBars) => html`
          <tr>
          <td><div class="custom-cell-content">${iBars}</div></td>
          <td><div class="custom-cell-content">${elementInputs.val.areas.get(iBars)}</div></td>
          <td><div class="custom-cell-content">${analyzeOutputs.val.normals.get(iBars)[0].toFixed(0)}</div></td>
      </tr>
        `
      )}
    </table>
    <br><br><br>
  `
  ;
};

document.body.append(
  parameters(params),
  viewer({
    structure: {
      nodes,
      elements,
      nodeInputs,
      elementInputs,
      deformOutputs,
      analyzeOutputs,
    },
    settingsObj: {
      gridSize: 1000,
    },
    reportObj: {
      template,
      data: nodes,
    },
  })
);

const options = { day: "numeric", month: "long", year: "numeric" };
document.getElementById("reportDate").textContent = new Date().toLocaleDateString("en-US", options);

