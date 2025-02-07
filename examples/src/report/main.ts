import { Structure } from "awatif-data-structure";
import { viewer } from "awatif-ui";
import { html, TemplateResult } from "lit-html";
import van from "vanjs-core";

const nodes = van.state([0, 0, 1]);

const template: (nodes: Structure["nodes"]) => TemplateResult = (nodes) => {
  return html`<p>Number of nodes: ${nodes.val.length}</p>`;
};

setTimeout(() => {
  nodes.val = [];
}, 2000);

document.body.append(
  viewer({
    reportObj: {
      template,
      data: nodes,
    },
  })
);
