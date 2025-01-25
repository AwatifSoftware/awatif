import van, { State } from "vanjs-core";
import { Building, Structure } from "awatif-data-structure";
import { viewer } from "awatif-ui";
import { meshing } from "./meshing";

const building: Building = {
  points: van.state([
    [0, 0, 1],
    [10, 0, 1],
    [10, 10, 1],
    [0, 10, 1],
    [0, 0, 3],
    [10, 0, 3],
    [10, 10, 3],
    [0, 10, 3],
  ]),
  stories: van.state([0, 4]),
  columns: van.state([0, 1, 2, 3]),
  slabs: van.state([
    [0, 1, 2, 3],
    [4, 5, 6, 7],
  ]),
  columnsByStory: van.state(new Map([[0, [0, 1, 2, 3]]])),
  slabsByStory: van.state(
    new Map([
      [0, [0]],
      [1, [1]],
    ])
  ),
  columnData: van.state(
    new Map([
      [0, {}],
      [1, {}],
      [2, {}],
      [3, {}],
    ])
  ),
  slabData: van.state(
    new Map([
      [0, {}],
      [1, {}],
    ])
  ),
};

const structure: Structure = meshing(building);

document.body.append(
  viewer({
    structure: structure,
    settingsObj: {
      nodes: false,
    },
  })
);
