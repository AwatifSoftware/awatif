import { w2grid } from "w2ui";
import van, { State } from "vanjs-core";
import "w2ui/w2ui-2.0.min.css";
import "./styles.css";

type Table = number[][];
export type Data = object | Table;

export function grid({
  fields,
  data,
  units,
  onChange,
}: {
  fields: object[];
  data: State<Data>;
  units?: string[]; // Optional array for units
  onChange?: (data: Data) => void;
}): HTMLDivElement {
  // Initialize
  const gridElm = document.createElement("div");

  const grid = new w2grid({
    name: Math.random().toString().substring(2),
    box: gridElm,
    selectType: "cell",
    recordHeight: 26,
    show: { columnMenu: false, lineNumbers: true },
    columns: toColumns(fields),
    records: toRecords(data.rawVal, fields),
  });

  // Add IDs to elements
  gridElm.setAttribute("id", "grid");

  // Event: On refresh, add units row under headers
  grid.onRefresh = () => {
    const headerElm = gridElm.querySelector(".w2ui-grid-header") as HTMLElement;
    if (!headerElm || !units) return;

    // Check if units row already exists
    if (headerElm.querySelector(".units-row")) return;

    // Create units row
    const unitsRow = document.createElement("div");
    unitsRow.classList.add("units-row");
    unitsRow.style.display = "flex";
    unitsRow.style.justifyContent = "space-between";
    unitsRow.style.padding = "0 8px";
    unitsRow.style.backgroundColor = "#f0f0f0";
    unitsRow.style.borderBottom = "1px solid #ccc";

    // Add unit labels
    fields.forEach((_, index) => {
      const unitCell = document.createElement("div");
      unitCell.textContent = units[index] || ""; // Use units array
      unitCell.style.flex = "1";
      unitCell.style.textAlign = "center";
      unitCell.style.fontSize = "12px";
      unitCell.style.fontStyle = "italic";
      unitRow.appendChild(unitCell);
    });

    headerElm.appendChild(unitsRow);
  };

  // Event: On data change
  van.derive(() => {
    grid.records = toRecords(data.val, fields);
    grid.refresh();
  });

  return gridElm;
}

// Utils remain the same as the original code


// Utils
const FIELDS_INDEXES = "ABCDEFGHIJKLMNOPRST";

function toColumns(fields: object[]): object[] {
  const columns = FIELDS_INDEXES.split("").map((fieldIndex) => ({
    field: fieldIndex,
    text: '<div style="text-align: center">' + fieldIndex + "</div>",
    size: "90px",
    resizable: true,
    sortable: true,
    editable: { type: "text" },
  }));

  return columns.map((baseColumn) => {
    const matchingField = fields.find(
      // @ts-ignore
      (field) => field.field === baseColumn.field
    );

    if (matchingField) {
      return {
        ...baseColumn,
        ...matchingField,
      };
    }
    return baseColumn;
  });
}

function toRecords(data: Data, fields: object[]): object[] {
  const table = Array.isArray(data) ? data : toTable(data, fields);

  const records = Array(50)
    .fill(0)
    .map((_, i) => ({ recid: i }));
  const fieldsIndexes = FIELDS_INDEXES.split("");

  for (let i = 0; i < table.length; i++) {
    for (let j = 0; j < table[i].length; j++) {
      records[i][fieldsIndexes[j]] = table[i][j];
    }
  }

  return records;

  // Utils
  function toTable(data: object, fields: object[]) {
    const fieldsMap = new Map();
    fields.forEach((v: any) => fieldsMap.set(v.field, v));

    return Object.keys(data).map((k) => [fieldsMap.get(k).text, data[k]]);
  }
}

function toData(records: object[], fields: object[]): Data {
  // @ts-ignore
  const isTable = FIELDS_INDEXES.includes(fields[0].field);

  if (isTable) return toTable(records, fields);

  return toObject(records, fields);

  // Utils
  function toTable(records: object[], fields: object[]): Table {
    let table = [...Array(records.length)].map(() => [...Array(fields.length)]);
    const fieldsIndexes = FIELDS_INDEXES.split("");

    for (let i = 0; i < table.length; i++) {
      for (let j = 0; j < table[i].length; j++) {
        table[i][j] = records[i][fieldsIndexes[j]] ?? "";
      }
    }

    return table.slice(0, findLastNonEmptyRow(table) + 1);

    // utils
    function findLastNonEmptyRow(table: Table) {
      for (let i = table.length - 1; i >= 0; i--) {
        // @ts-ignore
        if (table[i].some((v) => v !== "")) {
          return i;
        }
      }
    }
  }

  function toObject(records: object[], fields: object[]): object {
    return Object.fromEntries(
      fields.map(({ field }: any, i) => [field, records[i]["B"]])
    );
  }
}
