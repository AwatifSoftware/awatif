import { Structure } from "awatif-data-structure";
import { viewer } from "awatif-ui";
import van, { State } from "vanjs-core";
import {
  Node,
  Element,
  AnalysisInputs,
  AnalysisOutputs,
} from "awatif-data-structure";
import { report } from "awatif-ui/src/viewer/report/report";
import { html, TemplateResult } from "lit-html";

van.derive(() => {
    const nodes: Node[] = [];
    const elements: Element[] = []; })

// Define the report function, which takes any data as input (in this case, the nodes) and outputs the TemplateResult type, as shown below:
const template: (nodes: Structure["nodes"]) => TemplateResult = (nodes) => {
    return html`<p>Number of nodes: ${nodes.val.length}</p>`;
  };

// Then, when creating the viewer element, add the report along with the data used so the report can render it.
document.body.append(
viewer({
    structure: {
    nodes,
    elements,
    },
    report: {
    template: template,
    data: nodes,
    },
})
);