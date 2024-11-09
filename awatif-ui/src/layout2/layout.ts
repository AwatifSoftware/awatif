import { w2layout } from "w2ui";
import "w2ui/w2ui-2.0.min.css";
import "./styles.css";

export function layout2({
  left,
  bottom,
  main,
  preview,
  right,
}: {
  left?: HTMLElement;
  bottom?: HTMLElement;
  main: HTMLElement;
  preview?: HTMLElement;
  right?: HTMLElement;
}): HTMLElement {
  // init
  const layoutElm = document.createElement("div");

  const style = "border: 1px solid #efefef";

  const topLayout = new w2layout({
    name: "topLayout",
    panels: [
      ...(left
        ? [{ type: "left", size: "100%", html: getW2Elm(left) }]
        : []),
      ...(bottom ? [{ type: "bottom", html: getW2Elm(bottom) }] : []),
    ],
  });

  new w2layout({
    box: layoutElm,
    name: "layout",
    panels: [
      ...(left || bottom
        ? [{ type: "top", size: 60, style, html: topLayout }]
        : []),
      { type: "main", style, html: getW2Elm(main) },
      ...(preview
        ? [
            {
              type: "preview",
              size: "50%",
              resizable: true,
              style,
              html: getW2Elm(preview),
            },
          ]
        : []),
      ...(right
        ? [
            {
              type: "right",
              size: "65%",
              resizable: true,
              style,
              html: getW2Elm(right),
            },
          ]
        : []),
    ],
  });

  // update
  layoutElm.id = "layout";

  return layoutElm;
}

// Utils
function getW2Elm(elm: HTMLElement): { render: () => void } {
  return {
    render: function () {
      this.box.append(elm);
    },
  };
}
