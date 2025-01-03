import { Element, ElementInputs, NodeInputs } from "awatif-data-structure";

export function getFreeIndices(
  supportsInputs: NodeInputs["supports"],
  elementInputs: ElementInputs,
  elements: Element[],
  dof: number
): number[] {
  const supportsIndexes: number[] = [];
  supportsInputs?.forEach((support, index) => {
    if (support[0]) supportsIndexes.push(index * 6);
    if (support[1]) supportsIndexes.push(index * 6 + 1);
    if (support[2]) supportsIndexes.push(index * 6 + 2);
    if (support[3]) supportsIndexes.push(index * 6 + 3);
    if (support[4]) supportsIndexes.push(index * 6 + 4);
    if (support[5]) supportsIndexes.push(index * 6 + 5);
  });

  // Todo: find a cleaner way to incorporate bar and beams
  const barNodes = new Set<number>();
  elementInputs?.momentsOfInertiaY?.forEach((momentOfInertiaY, index) => {
    if (!momentOfInertiaY) {
      const element = elements[index];
      barNodes.add(element[0]);
      barNodes.add(element[1]);
    }
  });
  elementInputs?.momentsOfInertiaZ?.forEach((momentOfInertiaZ, index) => {
    if (!momentOfInertiaZ) {
      const element = elements[index];
      barNodes.add(element[0]);
      barNodes.add(element[1]);
    }
  });

  const rotationIndexes: number[] = [];
  barNodes.forEach((index) => {
    rotationIndexes.push(index * 6 + 3);
    rotationIndexes.push(index * 6 + 4);
    rotationIndexes.push(index * 6 + 5);
  });

  return Array(dof)
    .fill(0)
    .map((_, i) => i)
    .filter(
      (v) => !supportsIndexes.includes(v) && !rotationIndexes.includes(v)
    );
}
