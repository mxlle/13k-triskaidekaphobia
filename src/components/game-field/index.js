import "./game-field.scss";

import { createElement } from "../../utils/html-utils";
import { getGameFieldData, isDoor, isTable } from "../../game-logic";

export function getGameField() {
  const gameField = createElement({
    cssClass: "game-field",
  });

  const gameFieldData = getGameFieldData();

  gameFieldData.forEach((row, i) => {
    const rowElem = createElement({
      cssClass: "row",
    });
    gameField.append(rowElem);

    row.forEach((cell, j) => {
      const cellElem = createElement({
        cssClass: `cell${isTable(cell) ? " table" : ""}${isDoor(cell) ? " door" : ""}`,
        text: cell.content,
        onClick: (event) => {
          event.target.classList.toggle("selected");
        },
      });
      rowElem.append(cellElem);

      if (cell.fear) {
        const fearElem = createElement({
          cssClass: "fear",
          text: cell.fear,
        });
        cellElem.append(fearElem);
      }
    });
  });

  return gameField;
}
