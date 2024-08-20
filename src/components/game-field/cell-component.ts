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

export function createCellElement(cell: Cell, isInMiddle: boolean = false) {
  const cellElem = createElement({
    cssClass: "cell",
  });

  if (hasPerson(cell)) {
    cellElem.classList.add("has-person");
  }

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

  const fearElem = createElement({
    cssClass: `fear${cell.fear ? "" : " hidden"}`,
    text: cell.fear,
  });
  cellElem.append(fearElem);

  const smallFearElem = createElement({
    cssClass: `fear small${cell.smallFear ? "" : " hidden"}`,
    text: cell.smallFear,
  });
  cellElem.append(smallFearElem);

  cell.elem = cellElem;
  cell.textElem = textElem;
  cell.fearElem = fearElem;
  cell.smallFearElem = smallFearElem;

  setCellFearTooltips(cell);
}

export function updateCell(cell: Cell) {
  cell.textElem!.textContent = cell.content;
  cell.fearElem!.textContent = cell.fear ?? null;
  cell.fearElem!.classList.toggle("hidden", !cell.fear);
  cell.smallFearElem!.textContent = cell.smallFear ?? null;
  cell.smallFearElem!.classList.toggle("hidden", !cell.smallFear);
  cell.elem!.classList.toggle("has-person", hasPerson(cell));
  cell.elem!.classList.toggle("panic", cell.hasPanic);
  setCellFearTooltips(cell);
}

function setCellFearTooltips(cell: Cell) {
  const isGerman = isGermanLanguage();
  const fearName = cell.fear ? getPhobiaName(cell.fear, isGerman) : "";
  const smallFearName = cell.smallFear
    ? getPhobiaName(cell.smallFear, isGerman)
    : "";
  cell.fearElem!.setAttribute("title", fearName);
  cell.smallFearElem!.setAttribute("title", smallFearName);
}
