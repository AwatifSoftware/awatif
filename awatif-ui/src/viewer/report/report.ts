import van, { State } from "vanjs-core";
import { render } from "lit-html";

// in awatif-ui/src/viewer/report/report.ts

export function report({
    template,
    data,
  }: {
    template: (data: object) => HTMLDivElement;
    data: object;
  }): HTMLElement {
    // Create a container element where you can append two elements: Button and Dialog
    const container = document.createElement("div"); // Refer to the settings element to see how to style with CSS (awatif-ui/src/viewer/setting/)

    // Create the Button and Dialog, then append them to the container
    // Refer to the old implementation to see how these elements were created: https://github.com/madil4/awatif/blob/3cb79f5b01c056ee6b18960bf657a027041a8ba2/awatif-ui/src/report.ts
    
    // Create an event handler; on each data change, it will render the elements
    van.derive(() => {
      render(template(data), dialogBodyElm.value);
    });
  
    return container;
  }