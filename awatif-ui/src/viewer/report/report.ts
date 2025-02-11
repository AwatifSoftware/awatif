import { html, render, TemplateResult } from "lit-html";
import { createRef, ref } from "lit-html/directives/ref.js";
import van, { State } from "vanjs-core";
import { jsPDF } from "jspdf";
import "./style.css";
import html2canvas from "html2canvas";

export function report({
  template,
  data,
}: {
  template: (data: State<object>) => TemplateResult;
  data: State<object>;
}): HTMLElement {
  const container = document.createElement("div");

  // report button
  const button = document.createElement("report-button");
  button.textContent = "Report";
  button.classList.add("report-button");

  // dialog
  let dialogElm = createRef<HTMLDialogElement>();
  let dialogBodyElm = createRef<HTMLDivElement>();

  // Print button
  const printButton = document.createElement("print-button");
  printButton.textContent = "Print";
  printButton.id = "print-button"; // Add the ID for the print button
  printButton.classList.add("print-button");

  // date
  // document.getElementById("reportDate").textContent = new Date().toLocaleDateString();



  // dialog template
  const dialogTemp = html`
    <dialog ref=${ref(dialogElm)}>
      <div class="dialog-header">
        <span class="close" @click=${() => dialogElm.value?.close()}>&times;</span>
      </div>
      <div class="dialog-body" ref=${ref(dialogBodyElm)}>
        <div class="report-content">
          <!-- Content generated from the template -->
        </div>
        <!-- Print button inside the dialog -->
        <div class="print-container">
          ${printButton}
        </div>
      </div>
    </dialog>
  `;

  render(dialogTemp, container);
  container.append(button);

  // Open the dialog when the Report button is clicked
  button.addEventListener("click", () => {
    dialogElm.value?.show();
  });

  // Render report content inside the dialog
  van.derive(() => {
    render(template(data), dialogBodyElm.value);
  });


  printButton.addEventListener("click", async () => {
    const content = dialogBodyElm.value; // The div you want to print
  
    if (!content) {
      console.error("No content found for printing.");
      return;
    }
  
    const scaleFactor = 3; // Higher scale for better quality
    const margin = 10; // Margin in mm
  
    const canvas = await html2canvas(content, { 
      scale: scaleFactor,
      useCORS: true, 
      backgroundColor: "#ffffff"
    });
  
    const imgData = canvas.toDataURL("image/png");
  
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
  
    const imgWidth = 210 - 2 * margin; // A4 width minus margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let yPosition = margin;
  
    pdf.addImage(imgData, "PNG", margin, yPosition, imgWidth, imgHeight, "", "FAST");
  
    // Footer: Date and Page Number
    const totalPages = pdf.internal.getNumberOfPages();
    const today = new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
  
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.text(`${today}`, margin + 5, 287); // Bottom-left corner
      pdf.text(`Page ${i} of ${totalPages}`, 180 - margin, 287); // Bottom-right corner
    }
  
    pdf.save("report.pdf");
  });
  
  
  
  
  

  return container;
}
