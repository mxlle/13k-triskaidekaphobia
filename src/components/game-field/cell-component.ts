import { Cell } from "../../types";
import { createElement } from "../../utils/html-utils";
import {
  hasPerson,
  isChair,
  isDoor,
  isTable,
  isWindow,
} from "../../game-logic";
import { isGermanLanguage } from "../../translations";
import { getPhobiaName } from "../../phobia";

export interface CellElementObject {
  elem: HTMLElement;
  textElem: HTMLElement;
  fearElem: HTMLElement;
  smallFearElem: HTMLElement;
}

export function createCellElement(
  cell: Cell,
  isInMiddle: boolean = false,
): CellElementObject {
  const cellElem = createElement({
    cssClass: "cell",
  });

  if (isDoor(cell) || isWindow(cell)) {
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
  }

  if (isChair(cell)) {
    cellElem.classList.add("chair");
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
  cellElementObject.textElem.textContent = cell.content;
  cellElementObject.fearElem.textContent = cell.fear ?? null;
  cellElementObject.fearElem.classList.toggle("hidden", !cell.fear);
  cellElementObject.smallFearElem.textContent = cell.smallFear ?? null;
  cellElementObject.smallFearElem.classList.toggle("hidden", !cell.smallFear);
  cellElementObject.elem.classList.toggle("has-person", hasPerson(cell));
  cellElementObject.elem.classList.toggle("panic", cell.hasPanic);
  setCellFearTooltips(cell, cellElementObject);
}

function setCellFearTooltips(cell: Cell, cellElementObject: CellElementObject) {
  const isGerman = isGermanLanguage();
  const fearName = cell.fear ? getPhobiaName(cell.fear, isGerman) : "";
  const smallFearName = cell.smallFear
    ? getPhobiaName(cell.smallFear, isGerman)
    : "";
  cellElementObject.fearElem.setAttribute("title", fearName);
  cellElementObject.smallFearElem.setAttribute("title", smallFearName);
}
