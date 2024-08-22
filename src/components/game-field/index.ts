import "./game-field.scss";

import { createButton, createElement } from "../../utils/html-utils";
import { moveGuest, newGame } from "../../logic/game-logic";
import { Cell, GameFieldData, hasPerson, isSameCell } from "../../types";
import { createWinScreen } from "../win-screen/win-screen";
import { CellElementObject, createCellElement, updateCell } from "./cell-component";
import { getTranslation, TranslationKey } from "../../translations";
import { globals } from "../../globals";
import { sleep } from "../../utils/promise-utils";
import { getGameFieldData } from "../../logic/initialize";
import { checkTableStates, getHappyStats } from "../../logic/checks";
import { PubSubEvent, pubSubService } from "../../utils/pub-sub-service";
import { handlePokiCommercial, pokiSdk } from "../../poki-integration";

let gameFieldElem: HTMLElement | undefined;
let clickedCell: Cell | undefined;
const cellElements: CellElementObject[][] = [];

export async function initializeEmptyGameField() {
  document.body.classList.remove("selecting");

  const baseData = getGameFieldData(true);

  if (gameFieldElem) {
    await updateGameFieldElement(baseData);
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

export async function startNewGame() {
  document.body.classList.remove("selecting");

  if (globals.gameFieldData.length && gameFieldElem) {
    // reset old game field
    const baseData = getGameFieldData(true);
    pubSubService.publish(PubSubEvent.UPDATE_SCORE, baseData);
    await updateGameFieldElement(baseData);
    await handlePokiCommercial();
    await sleep(300);
  }

  globals.gameFieldData = getGameFieldData();

  if (gameFieldElem) {
    await updateGameFieldElement(globals.gameFieldData);
  } else {
    gameFieldElem = generateGameFieldElement(globals.gameFieldData);
    document.body.append(gameFieldElem);
  }

  updateState(globals.gameFieldData);

  pokiSdk.gameplayStart();
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

function updateState(gameFieldData: Cell[][], skipWinCheck = false) {
  const panickedTableCells = checkTableStates(gameFieldData);
  updatePanicStates(gameFieldData, panickedTableCells);
  pubSubService.publish(PubSubEvent.UPDATE_SCORE, gameFieldData);
  const { hasWon } = getHappyStats(gameFieldData);

  if (hasWon && !skipWinCheck) {
    createWinScreen();
    pokiSdk.gameplayStop();
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

export async function updateGameFieldElement(gameFieldData: GameFieldData) {
  const flatGameFieldData = gameFieldData.flat();

  for (let i = 0; i < flatGameFieldData.length; i++) {
    const cell: Cell = flatGameFieldData[i];
    const cellElementObject = getCellElementObject(cell);
    const hadPerson = cellElementObject.elem.classList.contains("has-person");
    updateCell(cell, cellElementObject);
    if (hasPerson(cell) || hadPerson) {
      await sleep(50);
    }
  }
}

export function updatePanicStates(gameFieldData: GameFieldData, panickedTableCells: Cell[]) {
  gameFieldData.flat().forEach((cell) => {
    const cellElementObject = getCellElementObject(cell);
    cellElementObject.elem.classList.remove("scary");
    cellElementObject.elem.classList.remove("scared");
    cellElementObject.elem.classList.remove("triskaidekaphobia");

    if (hasPerson(cell)) {
      cellElementObject.elem.classList.toggle("panic", cell.person.hasPanic);
    }
  });

  panickedTableCells.forEach((cell) => {
    const cellElementObject = getCellElementObject(cell);
    cellElementObject.elem.classList.add("triskaidekaphobia");
  });
}

export function updateStateForSelection(gameFieldData: GameFieldData, selectedCell: Cell | undefined) {
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

  if (!hasPerson(selectedCell)) {
    return;
  }

  selectedCell.person.afraidOf.forEach((afraidOf) => {
    getCellElementObject(afraidOf).elem.classList.add("scary");
  });

  selectedCell.person.makesAfraid.forEach((makesAfraid) => {
    getCellElementObject(makesAfraid).elem.classList.add("scared");
  });
}
