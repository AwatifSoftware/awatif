import { unsafeHTML } from "lit-html/directives/unsafe-html.js";
import katex from "katex";

export function renderMath(latex: string) {
  return unsafeHTML(katex.renderToString(latex, { strict: false }));
}

export function toggleView(event: Event) {
  const button = event.currentTarget as HTMLElement;
  const content = button.nextElementSibling as HTMLElement;

  if (content) {
    button.classList.toggle("active");
    content.classList.toggle("active");
  }
}

