import { AnalysisInputs, QuadrilateralElement } from "awatif-data-structure";

export function getFreeIndices(
  supportsInputs: AnalysisInputs["pointSupports"],
  sectionInputs: AnalysisInputs["sections"],
  elements: QuadrilateralElement[],
  dof: number
): number[] {
  const supportsIndexes: number[] = [];
  supportsInputs?.forEach((support, index) => {
    if (support[0]) supportsIndexes.push(index * 6);
    if (support[1]) supportsIndexes.push(index * 6 + 1);
    if (support[2]) supportsIndexes.push(index * 6 + 2);
  
  });

  // Apply your function that extracts constraints and gegit 
  const plateNodes = new Set<number>();
  sectionInputs?.forEach((section, index) => {
    if (!section.momentOfInertiaY && !section.momentOfInertiaZ) {
      const element = elements[index];
      plateNodes.add(element[0]);
      plateNodes.add(element[1]);
    }
  });


  return Array(dof)
    .fill(0)
    .map((_, i) => i)
    .filter(
      (v) => !supportsIndexes.includes(v) 
    );
}
