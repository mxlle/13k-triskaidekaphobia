import "./game-field.scss";

import { createElement } from "../../utils/html-utils";
import {
  checkTableStates,
  getGameFieldData,
  getHappyStats,
  hasPerson,
  isSameCell,
  moveGuest,
} from "../../game-logic";
import { Cell, GameFieldData } from "../../types";
import { scoreElement } from "../../index";
import { createWinScreen } from "../win-screen/win-screen";
import { createCellElement, updateCell } from "./cell-component";

let gameFieldElem: HTMLElement | undefined;
let clickedCell: Cell | undefined;

export function createGameField() {
  if (gameFieldElem) {
    document.body.classList.remove("selecting");
    gameFieldElem.remove();
    gameFieldElem = undefined;
  }

  const gameFieldData = getGameFieldData();

  function cellClickHandler(cell: Cell) {
    if (clickedCell) {
      if (isSameCell(clickedCell, cell)) {
        resetSelection(cell);
        updateStateForSelection(gameFieldData, clickedCell);
        return;
      }

      if (hasPerson(cell)) {
        clickedCell.elem.classList.remove("selected");
        clickedCell = cell;
        updateStateForSelection(gameFieldData, clickedCell);
        return;
      }

      moveGuest(clickedCell, cell);
      updateCell(clickedCell);
      updateCell(cell);
      resetSelection(cell);
      updateState(gameFieldData);
    } else {
      clickedCell = cell;
      updateStateForSelection(gameFieldData, clickedCell);
    }

    document.body.classList.toggle("selecting", !!clickedCell);
  }

  gameFieldElem = getGameField(gameFieldData, cellClickHandler);
  document.body.append(gameFieldElem);

  updateState(gameFieldData);
}

function resetSelection(cell: Cell) {
  if (clickedCell) {
    clickedCell.elem.classList.remove("selected");
    clickedCell = undefined;
  }

  cell.elem.classList.remove("selected");

  document.body.classList.remove("selecting");
}

function updateState(gameFieldData: Cell[][]) {
  const panickedTableCells = checkTableStates(gameFieldData);
  updatePanicStates(gameFieldData, panickedTableCells);
  const { unseatedGuests, unhappyGuests, happyGuests, totalGuests } =
    getHappyStats(gameFieldData);
  scoreElement.textContent = `${unseatedGuests}🚪 + ${unhappyGuests} 😱 + ${happyGuests} 😀 / ${totalGuests}`;

  if (happyGuests === totalGuests) {
    createWinScreen();
  }
}

export function getGameField(
  gameFieldData: Cell[][],
  cellClickHandler: (cell: Cell, row: number, column: number) => void,
) {
  const gameField = createElement({
    cssClass: "game-field",
  });

  gameFieldData.forEach((row, rowIndex) => {
    const rowElem = createElement({
      cssClass: "row",
    });
    gameField.append(rowElem);

    row.forEach((cell, columnIndex) => {
      const isInMiddle = rowIndex === Math.ceil(gameFieldData.length / 2) - 1;
      createCellElement(cell, isInMiddle);

      if (!cell.elem) {
        console.error("Cell element is not created");
        return;
      }

      cell.elem.addEventListener("click", () => {
        cellClickHandler(cell, rowIndex, columnIndex);
      });

      rowElem.append(cell.elem!);
    });
  });

  return gameField;
}

export function updatePanicStates(
  gameFieldData: GameFieldData,
  panickedTableCells: Cell[],
) {
  gameFieldData.flat().forEach((cell) => {
    cell.elem!.classList.remove("scary");
    cell.elem!.classList.remove("scared");
    cell.elem!.classList.remove("triskaidekaphobia");

    if (hasPerson(cell)) {
      cell.elem!.classList.toggle("panic", cell.hasPanic);
    }
  });

  panickedTableCells.forEach((cell) => {
    cell.elem!.classList.add("triskaidekaphobia");
  });
}

export function updateStateForSelection(
  gameFieldData: GameFieldData,
  selectedCell: Cell | undefined,
) {
  gameFieldData.flat().forEach((cell) => {
    cell.elem!.classList.remove("scary");
    cell.elem!.classList.remove("scared");
  });

  if (!selectedCell) {
    return;
  }

  selectedCell.elem!.classList.add("selected");

  selectedCell.afraidOf?.forEach((afraidOf) => {
    afraidOf.elem?.classList.add("scary");
  });

  selectedCell.makesAfraid?.forEach((makesAfraid) => {
    makesAfraid.elem?.classList.add("scared");
  });
}
