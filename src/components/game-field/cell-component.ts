import { BasePerson, Cell, hasPerson, isChair, isTable, Person } from "../../types";
import { createElement } from "../../utils/html-utils";
import { getNearestTableCell } from "../../logic/checks";
import { globals } from "../../globals";
import { getCellElement } from "./game-field";

export function createCellElement(cell: Cell, isInMiddle: boolean = false, isOnTheRightOfATable: boolean = false): HTMLElement {
  const cellElem = createElement({
    cssClass: "cell",
  });

  if (isTable(cell)) {
    cellElem.classList.add("table");

    if (isInMiddle) {
      cellElem.classList.add("middle");
    }

    const plateElem1 = createElement({
      cssClass: "plate",
      text: "🍽️",
    });
    const plateElem2 = createElement({
      cssClass: "plate",
      text: "🍽️",
    });

    cellElem.append(plateElem1);
    cellElem.append(plateElem2);
  }

  if (isChair(cell)) {
    cellElem.classList.add("chair");

    const chairElement = createElement({
      tag: "span",
      cssClass: "chair-inner",
    });

    if (isOnTheRightOfATable) {
      chairElement.classList.add("right");
    }

    cellElem.append(chairElement);
  }

  return cellElem;
}

export function updateCellOccupancy(cell: Cell, cellElement: HTMLElement): void {
  const person: Person | undefined = cell.person;

  // cellElement.children[1]?.remove(); // todo - improve this

  if (person) {
    cellElement.append(person.personElement);
  }

  cellElement.classList.toggle("has-person", hasPerson(cell));
  cellElement.classList.toggle("panic", person?.hasPanic ?? false);

  const nearestTableCell = getNearestTableCell(globals.gameFieldData, cell);

  if (nearestTableCell && isChair(cell)) {
    const classToToggle = nearestTableCell.column < cell.column ? "has-right" : "has-left";
    if (nearestTableCell) {
      getCellElement(nearestTableCell).classList.toggle(classToToggle, !!person);
    }
  }
}

export function createPersonElement(person: BasePerson): HTMLElement {
  const personElem = createElement({
    cssClass: "person",
  });

  const personTextElem = createElement({
    tag: "span",
    cssClass: "emoji",
    text: person.name,
  });

  personElem.append(personTextElem);

  if (person.fear) {
    const fearElem = createElement({ cssClass: `fear`, text: person.fear });
    personElem.append(fearElem);
  }

  if (person.smallFear) {
    const smallFearElem = createElement({ cssClass: `fear small`, text: person.smallFear });
    personElem.append(smallFearElem);
  }

  return personElem;
}
