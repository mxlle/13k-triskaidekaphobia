import { Cell, hasPerson, isChair, isDoor, isTable, OccupiedCell, Person } from "../../types";
import { createElement } from "../../utils/html-utils";
import { isGermanLanguage } from "../../translations/i18n";
import { getPhobiaName } from "../../phobia";

export interface CellElementObject {
  elem: HTMLElement;
  textElem: HTMLElement;
  fearElem: HTMLElement;
  smallFearElem: HTMLElement;
}

export function createCellElement(cell: Cell, isInMiddle: boolean = false, isOnTheRightOfATable: boolean = false): CellElementObject {
  const cellElem = createElement({
    cssClass: "cell",
  });

  if (isDoor(cell)) {
    cellElem.classList.add("door");
  }

  if (isTable(cell)) {
    cellElem.classList.add("table");

    if (isInMiddle) {
      cellElem.classList.add("middle");

      const textElem = createElement({
        tag: "span",
        text: "13",
      });

      cellElem.append(textElem);
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

  const textElem = createElement({
    tag: "span",
    cssClass: "text",
    text: cell.content,
  });

  if (!isTable(cell)) {
    cellElem.append(textElem);
  }

  const fearElem = createElement({ cssClass: `fear hidden` });
  cellElem.append(fearElem);

  const smallFearElem = createElement({ cssClass: `fear small hidden` });
  cellElem.append(smallFearElem);

  const cellElementObject: CellElementObject = {
    elem: cellElem,
    textElem: textElem,
    fearElem: fearElem,
    smallFearElem: smallFearElem,
  };

  updateCell(cell, cellElementObject);

  return cellElementObject;
}

export function updateCell(cell: Cell, cellElementObject: CellElementObject) {
  const person: Person | undefined = cell.person;

  cellElementObject.textElem.textContent = person?.name ?? cell.content;
  cellElementObject.fearElem.textContent = person?.fear ?? null;
  cellElementObject.fearElem.classList.toggle("hidden", !person?.fear ?? false);
  cellElementObject.smallFearElem.textContent = person?.smallFear ?? null;
  cellElementObject.smallFearElem.classList.toggle("hidden", !person?.smallFear ?? false);
  cellElementObject.elem.classList.toggle("has-person", hasPerson(cell));
  cellElementObject.elem.classList.toggle("panic", person?.hasPanic ?? false);

  if (hasPerson(cell)) {
    setCellFearTooltips(cell, cellElementObject);
  }
}

function setCellFearTooltips(cell: OccupiedCell, cellElementObject: CellElementObject) {
  const isGerman = isGermanLanguage();
  const person = cell.person;
  const fearName = person.fear ? getPhobiaName(person.fear, isGerman) : "";
  const smallFearName = person.smallFear ? getPhobiaName(person.smallFear, isGerman) : "";
  cellElementObject.fearElem.setAttribute("title", fearName);
  cellElementObject.smallFearElem.setAttribute("title", smallFearName);
}
