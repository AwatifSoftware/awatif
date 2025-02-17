import { w2tabs } from "w2ui";
import { State } from "vanjs-core";
import { Data, grid } from "../grid/grid";
import "w2ui/w2ui-2.0.min.css";
import "./styles.css";

export function sheets({
  sheets,
  onChange,
}: {
  sheets: Map<
    string,
    {
      text: string;
      fields: object[];
      units: State<Data>;
      data: State<Data>;
    }
  >;
  onChange?: ({ sheet, data }) => void;
}): HTMLElement {
  const sheetsElm = document.createElement("div");
  const tabsElm = document.createElement("div");
  const contentWrapper = document.createElement("div"); // Wrapper for grids

  // Create tabs and grids
  const tabsData = [];
  const grids = new Map<string, HTMLDivElement>();
  sheets.forEach((sheet, index) => {
    tabsData.push({ id: index, text: sheet.text });
    grids.set(
      index,
      grid({ fields: sheet.fields, data: sheet.data, units: sheet.units, onChange: onGridChange })
    );
  });

  // Create W2UI tabs
  const tabs = new w2tabs({
    box: tabsElm,
    name: "tabs",
    active: tabsData[0].id,
    flow: "up",
    tabs: tabsData,
  });

  // Set IDs and append elements
  sheetsElm.id = "sheets";
  tabsElm.id = "tabs";
  contentWrapper.id = "content-wrapper"; // Wrapper for dynamic content
  contentWrapper.append(grids.values().next().value); // Add the first grid to wrapper
  sheetsElm.append(contentWrapper, tabsElm); // Append wrapper and tabs

  // Tabs click event
  tabs.onClick = (e: { target: string }) => {
    const activeGrid = grids.get(e.target);
    if (activeGrid) {
      contentWrapper.firstChild.replaceWith(activeGrid);
    }
  };

  // Grid change callback
  function onGridChange(data: Data) {
    if (onChange) onChange({ sheet: tabs.active, data });
  }

  return sheetsElm;
}
