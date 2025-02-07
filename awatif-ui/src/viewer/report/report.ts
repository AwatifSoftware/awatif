import { html, render, TemplateResult } from "lit-html";
import { createRef, ref } from "lit-html/directives/ref.js";
import van, { State } from "vanjs-core";

import "./style.css";

export function report({
  template,
  data,
}: {
  template: (data: State<object>) => TemplateResult;
  data: State<object>;
}): HTMLElement {
  const container = document.createElement("div"); // Refer to the settings element to see how to style with CSS (awatif-ui/src/viewer/setting/)

  // button
  const button = document.createElement("button");
  button.textContent = "report";
  button.style.position = "absolute";
  button.style.top = "10px";
  button.style.right = "10px";
  button.style.width = "100px";
  button.style.height = "50px";

  button.addEventListener("click", () => {
    dialogElm.value?.show();
  });

  // dialog
  let dialogElm = createRef<HTMLDialogElement>();
  let dialogBodyElm = createRef<HTMLDivElement>();

  const dialogTemp = html`<dialog ref=${ref(dialogElm)}>
    <div class="dialog-header">
      <span class="close" @click=${() => dialogElm.value?.close()}
        >&times;</span
      >
      Report
    </div>
    <div class="dialog-body" ref=${ref(dialogBodyElm)} >
  </dialog>`;

  render(dialogTemp, container);
  container.append(button);

  van.derive(() => {
    render(template(data), dialogBodyElm.value);
  });

  return container;
}
