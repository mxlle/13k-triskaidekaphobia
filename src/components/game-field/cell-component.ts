import {
  BasePerson,
  Cell,
  CellPositionWithTableIndex,
  findPerson,
  hasPerson,
  isAtTable,
  isChair,
  isTable,
  PlacedPerson,
} from "../../types";
import { createElement } from "../../utils/html-utils";
import { getNearestTableCell, isHappy } from "../../logic/checks";
import { globals } from "../../globals";
import { getCellElement } from "./game-field";
import { CssClass } from "../../utils/css-class";

export function createCellElement(cell: Cell, isInMiddle: boolean = false, isOnTheRightOfATable: boolean = false): HTMLElement {
  const cellElem = createElement({
    cssClass: CssClass.CELL,
  });

  if (isTable(cell)) {
    cellElem.classList.add(CssClass.TABLE);

    if (isInMiddle) {
      cellElem.classList.add(CssClass.MIDDLE);
    }

    const plateElem1 = createElement({
      cssClass: CssClass.PLATE,
      text: "🍽️",
    });
    const plateElem2 = createElement({
      cssClass: CssClass.PLATE,
      text: "🍽️",
    });

    cellElem.append(plateElem1);
    cellElem.append(plateElem2);
  }

  if (isChair(cell)) {
    cellElem.classList.add(CssClass.CHAIR);

    if (isOnTheRightOfATable) {
      cellElem.classList.add(CssClass.RIGHT);
    }
  }

  return cellElem;
}

export function updateCellOccupancy(cell: CellPositionWithTableIndex, cellElement: HTMLElement, skipUpdatePanic: boolean = false): void {
  const person: PlacedPerson | undefined = findPerson(globals.placedPersons, cell);

  if (person && hasPerson(globals.placedPersons, cell)) {
    const personElement: HTMLElement = person.personElement;
    cellElement.append(personElement);

    if (!skipUpdatePanic) updatePersonPanicState(person, personElement);
  }

  cellElement.classList.toggle(CssClass.HAS_PERSON, !!person);

  const nearestTableCell = getNearestTableCell(globals.gameFieldData, cell);

  if (nearestTableCell && isAtTable(cell)) {
    const classToToggle = nearestTableCell.column < cell.column ? CssClass.HAS_RIGHT : CssClass.HAS_LEFT;
    if (nearestTableCell) {
      getCellElement(nearestTableCell).classList.toggle(classToToggle, !!person);
    }
  }
}

export function updatePersonPanicState(person: PlacedPerson, personElement: HTMLElement = person.personElement): void {
  const hasPanic = !isHappy(person);
  personElement.classList.toggle(CssClass.PANIC, hasPanic);
  personElement.classList.toggle(CssClass.P_T13A, person.triskaidekaphobia && !person.hasPanic);
}

export function createPersonElement(person: BasePerson): HTMLElement {
  const personElem = createElement({
    cssClass: CssClass.PERSON,
  });

  const personTextElem = createElement({
    tag: "span",
    cssClass: CssClass.EMOJI,
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
