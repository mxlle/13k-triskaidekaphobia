import { BasePerson, Cell, hasPerson, isChair, isTable, OccupiedCell, Person } from "../../types";
import { createElement } from "../../utils/html-utils";
import { getNearestTableCell } from "../../logic/checks";
import { globals } from "../../globals";
import { CssClass, getCellElement } from "./game-field";

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

    if (isOnTheRightOfATable) {
      cellElem.classList.add("right");
    }
  }

  return cellElem;
}

export function updateCellOccupancy(cell: Cell, cellElement: HTMLElement, shouldCopyPerson: boolean = false): void {
  const person: Person | undefined = cell.person;

  if (person && hasPerson(cell)) {
    const personElement: HTMLElement = shouldCopyPerson ? (person.personElement.cloneNode(true) as HTMLElement) : person.personElement;
    cellElement.append(personElement);

    updatePersonPanicState(cell, personElement);
  }

  cellElement.classList.toggle(CssClass.HAS_PERSON, hasPerson(cell));

  const nearestTableCell = getNearestTableCell(globals.gameFieldData, cell);

  if (nearestTableCell && isChair(cell)) {
    const classToToggle = nearestTableCell.column < cell.column ? CssClass.HAS_RIGHT : CssClass.HAS_LEFT;
    if (nearestTableCell) {
      getCellElement(nearestTableCell).classList.toggle(classToToggle, !!person);
    }
  }
}

export function updatePersonPanicState(cell: OccupiedCell, personElement: HTMLElement = cell.person.personElement): void {
  const person = cell.person;
  const hasPanic = person.hasPanic || !isChair(cell) || person.triskaidekaphobia;
  personElement.classList.toggle(CssClass.PANIC, hasPanic);
  personElement.classList.toggle(CssClass.P_T13A, (person?.triskaidekaphobia ?? false) && !cell.person?.hasPanic);
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
