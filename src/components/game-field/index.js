import "./game-field.scss";

import { createElement } from "../../utils/html-utils";
import { isDoor, isTable } from "../../game-logic";

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
        cssClass: `cell${isTable(cell) ? " table" : ""}${isDoor(cell) ? " door" : ""}`,
        onClick: (event) => {
          event.target.classList.toggle("selected");
          cellClickHandler && cellClickHandler(cell, i, j);
        },
      });

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
  fromCell.content = fromCell.type;
  fromCell.fear = "";
  toCell.content = fromContent;
  toCell.fear = fromFear;
  updateCell(fromCell);
  updateCell(toCell);
  fromCell.elem.classList.remove("selected");
  toCell.elem.classList.remove("selected");
}

function updateCell(cell) {
  cell.textElem.textContent = cell.content;
  cell.fearElem.textContent = cell.fear;
  cell.fearElem.classList.toggle("hidden", !cell.fear);
}
