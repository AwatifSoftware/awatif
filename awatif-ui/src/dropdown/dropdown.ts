import { w2form } from "w2ui";
import "w2ui/w2ui-2.0.min.css";
import "./styles.css";

export function createDropdown(
  options: string[], 
  onChange?: (selected: string) => void
): HTMLElement {
  const dropdownElm = document.createElement("div");

  // Konfiguration für das Formular mit einem Dropdown-Feld
  const form = new w2form({
    name: 'dropdownForm',
    box: dropdownElm,
    fields: [
      { 
        field: 'dropdown', 
        type: 'list', 
        options: { items: options },
        html: { label: 'Wähle eine Option' }
      }
    ],
    actions: {
      save: function () {
        const selectedValue = this.record.dropdown.text;
        if (onChange) {
          onChange(selectedValue);
        }
      }
    }
  });

  return dropdownElm;
}
