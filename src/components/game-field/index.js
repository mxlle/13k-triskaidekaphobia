import "./game-field.scss";

import { createElement } from "../../utils/html-utils";
import {
  hasPerson,
  isChair,
  isDoor,
  isGuest,
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

      cellElem.append(textElem);

      const fearElem = createElement({
        cssClass: `fear${cell.fear ? "" : " hidden"}`,
        text: cell.fear,
      });
      cellElem.append(fearElem);

      cell.elem = cellElem;
      cell.textElem = textElem;
      cell.fearElem = fearElem;
    });
  });

  return gameField;
}

export function moveGuest(fromCell, toCell) {
  const fromContent = fromCell.content;
  const fromFear = fromCell.fear;
  fromCell.content = isGuest(fromCell) ? "" : fromCell.type;
  fromCell.fear = "";
  fromCell.hasPanic = false;
  toCell.content = fromContent;
  toCell.fear = fromFear;
  updateCell(fromCell);
  updateCell(toCell);
}

function updateCell(cell) {
  cell.textElem.textContent = cell.content;
  cell.fearElem.textContent = cell.fear;
  cell.fearElem.classList.toggle("hidden", !cell.fear);
  cell.elem.classList.toggle("has-person", hasPerson(cell));
  cell.elem.classList.toggle("panic", cell.hasPanic);
}

export function updatePanicStates(gameFieldData) {
  gameFieldData.forEach((row) => {
    row.forEach((cell) => {
      if (isChair(cell) && hasPerson(cell)) {
        cell.elem.classList.toggle("panic", cell.hasPanic);
      }
    });
  });
}
