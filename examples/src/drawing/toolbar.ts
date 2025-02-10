import { w2toolbar } from "w2ui";
import "w2ui/w2ui-2.0.min.css";
import "./styles.css";

export function toolbar({
  onToolbarClick,
}: {
  onToolbarClick: (floor: string) => void;
}): HTMLElement {
  const container = document.createElement("div");
  container.id = "toolbar";

  new w2toolbar({
    name: "toolbar",
    box: container,
    items: [
      {
        type: "radio",
        id: "1st-floor",
        text: "1st Floor",
        checked: true,
      },
      {
        type: "radio",
        id: "2nd-floor",
        text: "2nd Floor",
      },
    ],
    onClick(event) {
      onToolbarClick(event.target);
    },
  });

  return container;
}
