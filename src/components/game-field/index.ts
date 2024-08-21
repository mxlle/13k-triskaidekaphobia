import "./game-field.scss";

import { createButton, createElement } from "../../utils/html-utils";
import {
  checkTableStates,
  getGameFieldData,
  getHappyStats,
  hasPerson,
  isSameCell,
  moveGuest,
  newGame,
} from "../../game-logic";
import { Cell, GameFieldData } from "../../types";
import { scoreElement } from "../../index";
import { createWinScreen } from "../win-screen/win-screen";
import {
  CellElementObject,
  createCellElement,
  updateCell,
} from "./cell-component";
import { getTranslation, TranslationKey } from "../../translations";
import { globals } from "../../globals";

let gameFieldElem: HTMLElement | undefined;
let clickedCell: Cell | undefined;
const cellElements: CellElementObject[][] = [];

export function initializeEmptyGameField() {
  document.body.classList.remove("selecting");

  const baseData = getGameFieldData(true);

  if (gameFieldElem) {
    updateGameFieldElement(baseData);
  } else {
    gameFieldElem = generateGameFieldElement(baseData);
  }

  const startButton = createButton({
    text: getTranslation(TranslationKey.START_GAME),
    onClick: (event: MouseEvent) => {
      newGame();
      (event.target as HTMLElement)?.remove();
    },
  });
  startButton.classList.add("start-button", "primary-btn");

  gameFieldElem.append(startButton);

  document.body.append(gameFieldElem);
}

export function startNewGame() {
  document.body.classList.remove("selecting");

  globals.gameFieldData = getGameFieldData();

  if (gameFieldElem) {
    updateGameFieldElement(globals.gameFieldData);
  } else {
    gameFieldElem = generateGameFieldElement(globals.gameFieldData);
    document.body.append(gameFieldElem);
  }

  updateState(globals.gameFieldData);
}

function cellClickHandler(rowIndex: number, columnIndex: number) {
  const cell = globals.gameFieldData[rowIndex][columnIndex];
  const cellElementObject = getCellElementObject(cell);

  if (clickedCell) {
    const clickedCellElementObject = getCellElementObject(clickedCell);

    if (isSameCell(clickedCell, cell)) {
      resetSelection(cell);
      updateStateForSelection(globals.gameFieldData, clickedCell);
      return;
    }

    if (hasPerson(cell)) {
      clickedCellElementObject.elem.classList.remove("selected");
      clickedCell = cell;
      updateStateForSelection(globals.gameFieldData, clickedCell);
      return;
    }

    moveGuest(clickedCell, cell);
    updateCell(clickedCell, clickedCellElementObject);
    updateCell(cell, cellElementObject);
    resetSelection(cell);
    updateState(globals.gameFieldData);
  } else {
    clickedCell = cell;
    updateStateForSelection(globals.gameFieldData, clickedCell);
  }

  document.body.classList.toggle("selecting", !!clickedCell);
}

function getCellElementObject(cell: Cell): CellElementObject {
  return cellElements[cell.row]?.[cell.column];
}

function resetSelection(cell: Cell) {
  const cellElementObject = getCellElementObject(cell);
  const clickedCellElementObject = getCellElementObject(clickedCell);

  if (clickedCell) {
    clickedCellElementObject.elem.classList.remove("selected");
    clickedCell = undefined;
  }

  cellElementObject.elem.classList.remove("selected");

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

export function generateGameFieldElement(gameFieldData: GameFieldData) {
  const gameField = createElement({
    cssClass: "game-field",
  });

  gameFieldData.forEach((row, rowIndex) => {
    const rowElements: CellElementObject[] = [];
    const rowElem = createElement({
      cssClass: "row",
    });
    gameField.append(rowElem);

    row.forEach((cell, columnIndex) => {
      const isInMiddle = rowIndex === Math.ceil(gameFieldData.length / 2) - 1;
      const cellElementObject = createCellElement(cell, isInMiddle);

      cellElementObject.elem.addEventListener("click", () => {
        cellClickHandler(rowIndex, columnIndex);
      });

      rowElem.append(cellElementObject.elem);
      rowElements.push(cellElementObject);
    });

    cellElements.push(rowElements);
  });

  return gameField;
}

export function updateGameFieldElement(gameFieldData: GameFieldData) {
  const flatGameFieldData = gameFieldData.flat();

  for (let i = 0; i < flatGameFieldData.length; i++) {
    const cell: Cell = flatGameFieldData[i];
    updateCell(cell, getCellElementObject(cell));
  }
}

export function updatePanicStates(
  gameFieldData: GameFieldData,
  panickedTableCells: Cell[],
) {
  gameFieldData.flat().forEach((cell) => {
    const cellElementObject = getCellElementObject(cell);
    cellElementObject.elem.classList.remove("scary");
    cellElementObject.elem.classList.remove("scared");
    cellElementObject.elem.classList.remove("triskaidekaphobia");

    if (hasPerson(cell)) {
      cellElementObject.elem.classList.toggle("panic", cell.hasPanic);
    }
  });

  panickedTableCells.forEach((cell) => {
    const cellElementObject = getCellElementObject(cell);
    cellElementObject.elem.classList.add("triskaidekaphobia");
  });
}

export function updateStateForSelection(
  gameFieldData: GameFieldData,
  selectedCell: Cell | undefined,
) {
  gameFieldData.flat().forEach((cell) => {
    const cellElementObject = getCellElementObject(cell);
    cellElementObject.elem.classList.remove("scary");
    cellElementObject.elem.classList.remove("scared");
  });

  if (!selectedCell) {
    return;
  }

  const selectedCellElementObject = getCellElementObject(selectedCell);

  selectedCellElementObject.elem.classList.add("selected");

  selectedCell.afraidOf?.forEach((afraidOf) => {
    getCellElementObject(afraidOf).elem.classList.add("scary");
  });

  selectedCell.makesAfraid?.forEach((makesAfraid) => {
    getCellElementObject(makesAfraid).elem.classList.add("scared");
  });
}
