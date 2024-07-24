import van from "vanjs-core";
import { App, Model, ModelState, SettingsState } from "./types";
import { viewer } from "./viewer";
import { parameters } from "./parameters";
import { settings } from "./settings";

import "./styles/viewer.css";
import "./styles/settings.css";
import "./styles/parameters.css";
import "./styles/export.css";
import { exportIfc } from "./exportIfc";

export function app({
  parameters: parameterObj,
  onParameterChange,
  settings: settingsObj,
}: App) {
  // init
  const model = onParameterChange?.(parameterObj ?? {}) ?? {};
  const modelState: ModelState = van.state(getModelState(model));
  const settingsState: SettingsState = {
    gridSize: van.state(settingsObj?.gridSize ?? 20),
    displayScale: van.state(settingsObj?.displayScale ?? 1),
    nodes: van.state(settingsObj?.nodes ?? true),
    elements: van.state(settingsObj?.elements ?? true),
    nodesIndexes: van.state(settingsObj?.nodesIndexes ?? false),
    elementsIndexes: van.state(settingsObj?.elementsIndexes ?? false),
    orientations: van.state(settingsObj?.orientations ?? false),
    supports: van.state(settingsObj?.supports ?? true),
    loads: van.state(settingsObj?.loads ?? true),
    deformedShape: van.state(settingsObj?.deformedShape ?? false),
    elementResults: van.state(settingsObj?.elementResults ?? "none"),
    nodeResults: van.state(settingsObj?.nodeResults ?? "none"),
  };

  // update
  const viewerElement = viewer(modelState, settingsState);
  const settingElement = settings(model, settingsState);
  const exportElement = exportIfc(modelState);

  document.body.appendChild(viewerElement);
  document.body.appendChild(settingElement);
  document.body.appendChild(exportElement);

  // on parameter change
  if (parameterObj && onParameterChange) {
    const parametersElement = parameters(parameterObj, (e) => {
      // @ts-ignore
      parameterObj[e.target.key].value = e.value;

      modelState.val = getModelState(onParameterChange(parameterObj));
    });

    document.body.appendChild(parametersElement);
  }
}

// utils functions
const getModelState = (model?: Model): ModelState["val"] => ({
  nodes: model?.nodes ?? [],
  elements: model?.elements ?? [],
  analysisInputs: model?.analysisInputs ?? {},
  analysisOutputs: model?.analysisOutputs ?? {},
});
