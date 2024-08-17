import "./game-field.scss";

import { createElement } from "../../utils/html-utils";
import {
  hasPerson,
  isChair,
  isDoor,
  isTable,
  isWindow,
} from "../../game-logic";

export function getGameField(gameFieldData, cellClickHandler) {
  const gameField = createElement({
    cssClass: "game-field",
  });

  gameFieldData.forEach((row, i) => {
    const rowElem = createElement({
      cssClass: "row",
    });
    gameField.append(rowElem);

    row.forEach((cell, j) => {
      const cellElem = createElement({
        cssClass: "cell",
        onClick: (event) => {
          event.target.classList.toggle("selected");
          cellClickHandler && cellClickHandler(cell, i, j);
        },
      });

      if (hasPerson(cell)) {
        cellElem.classList.add("has-person");
      }

      if (isDoor(cell) || isWindow(cell)) {
        cellElem.classList.add("door");
      }

      if (isTable(cell)) {
        cellElem.classList.add("table");

        if (i === Math.ceil(gameFieldData.length / 2) - 1) {
          cellElem.classList.add("middle");
          cellElem.textContent = "13";
        }
      }

      if (isChair(cell)) {
        cellElem.classList.add("chair");
      }

      rowElem.append(cellElem);

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
    });
  });

  return gameField;
}

export function updateCell(cell) {
  cell.textElem.textContent = cell.content;
  cell.fearElem.textContent = cell.fear;
  cell.fearElem.classList.toggle("hidden", !cell.fear);
  cell.smallFearElem.textContent = cell.smallFear;
  cell.smallFearElem.classList.toggle("hidden", !cell.smallFear);
  cell.elem.classList.toggle("has-person", hasPerson(cell));
  cell.elem.classList.toggle("panic", cell.hasPanic);
}

export function updatePanicStates(gameFieldData, panickedTableCells) {
  gameFieldData.flat().forEach((cell) => {
    cell.elem.classList.remove("scary");
  });

  gameFieldData.forEach((row) => {
    row.forEach((cell) => {
      if (isChair(cell) && hasPerson(cell)) {
        cell.elem.classList.toggle("panic", cell.hasPanic);
      }
    });
  });

  panickedTableCells.forEach((cell) => {
    cell.elem.classList.add("scary");
  });
}
