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
      data: State<Data>;
      show: {
        toolbar: true,
        footer: true,
        toolbarSave: true
    },
    }
    
  >;
  onChange?: ({ sheet, data }) => void;
}): HTMLElement {
  const sheetsElm = document.createElement("div");
  const tabsElm = document.createElement("div");

  const tabsData = [];
  const grids = new Map<string, HTMLDivElement>();
  sheets.forEach((sheet, index) => {
    tabsData.push({ id: index, text: sheet.text });
    grids.set(
      index,
      grid({ fields: sheet.fields, data: sheet.data, onChange: onGridChange })
    );
  });

  const tabs = new w2tabs({
    box: tabsElm,
    name: "tabs",
    active: tabsData[0].id,
    flow: "up",
    tabs: tabsData,
  });

  // update
  sheetsElm.id = "sheets";
  tabsElm.id = "tabs";

  sheetsElm.append(grids.values().next().value, tabsElm);

  // events
  tabs.onClick = (e: { target: string }) => {
    sheetsElm.firstChild.replaceWith(grids.get(e.target));
  };

  function onGridChange(data: Data) {
    if (onChange) onChange({ sheet: tabs.active, data });
  }

  return sheetsElm;
}
