import { Pane } from "tweakpane";
import { ViewerSettingsState } from "./viewer";

export class ViewerSettingsPanel {
  private _pane: Pane;
  private _state: ViewerSettingsState;

  constructor(state: ViewerSettingsState) {
    this._state = state;
    this._pane = new Pane({ title: "Viewer Settings" });

    this._pane.element.style.width = "300px";

    this._pane.addInput(this._state, "supports");
    this._pane.addInput(this._state, "loads");
    this._pane.addInput(this._state, "deformed");
    this._pane.addInput(this._state, "results", {
      options: {
        none: "none",
        stress: "stress",
        steel: "steel",
      },
    });
  }

  set expanded(value: boolean) {
    this._pane.expanded = value;
  }

  get HTML() {
    return this._pane.element;
  }

  onChange(cb: () => void) {
    return this._pane.on("change", () => cb());
  }
}
