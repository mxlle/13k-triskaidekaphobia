import "./game-field.scss";

import { createButton, createElement } from "../../utils/html-utils";
import { moveGuest, newGame } from "../../logic/game-logic";
import { Cell, GameFieldData, hasPerson, isChair, isDoor, isSameCell, isTable, isWindow } from "../../types";
import { createWinScreen } from "../win-screen/win-screen";
import { CellElementObject, createCellElement, updateCell } from "./cell-component";
import { getTranslation, TranslationKey } from "../../translations";
import { globals } from "../../globals";
import { sleep } from "../../utils/promise-utils";
import { getGameFieldData } from "../../logic/initialize";
import { checkTableStates, getAllGuests, getHappyStats } from "../../logic/checks";
import { PubSubEvent, pubSubService } from "../../utils/pub-sub-service";
import { handlePokiCommercial, pokiSdk } from "../../poki-integration";
import { getOnboardingData, isOnboarding, OnboardingData, wasOnboarding } from "../../logic/onboarding";
import { getMiniHelpContent } from "../help/help";
import { getOnboardingArrow } from "../onboarding/onboarding-components";

let mainContainer: HTMLElement | undefined;
let gameFieldElem: HTMLElement | undefined;
let miniHelp: HTMLElement | undefined;
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

  appendGameField();
}

export async function startNewGame() {
  document.body.classList.remove("selecting");

  if (globals.gameFieldData.length && gameFieldElem) {
    // reset old game field
    pubSubService.publish(PubSubEvent.UPDATE_SCORE, globals.baseFieldData);
    await updateGameFieldElement(globals.baseFieldData);
    await handlePokiCommercial();
    await sleep(300);

    if (wasOnboarding()) {
      console.debug("Was onboarding, removing game field");
      gameFieldElem.remove();
      gameFieldElem = undefined;
    }
  }

  console.debug("Starting new game, onboarding step", globals.onboardingStep);

  globals.baseFieldData = getGameFieldData(true);
  globals.gameFieldData = getGameFieldData();

  if (!gameFieldElem) {
    gameFieldElem = generateGameFieldElement(globals.baseFieldData);
    appendGameField();
    await sleep(300);
  }

  await updateGameFieldElement(globals.gameFieldData);

  updateState(globals.gameFieldData);

  pokiSdk.gameplayStart();
}

function appendGameField() {
  if (!gameFieldElem) {
    console.warn("No game field element to append");
    return;
  }

  if (!mainContainer) {
    mainContainer = createElement({
      tag: "main",
    });
    document.body.append(mainContainer);
  }

  mainContainer.append(gameFieldElem);

  if (!miniHelp) {
    miniHelp = getMiniHelpContent();
  }

  mainContainer.append(miniHelp);
}

function cellClickHandler(rowIndex: number, columnIndex: number, onboardingArrow?: HTMLElement) {
  const cell = globals.gameFieldData[rowIndex][columnIndex];
  const cellElementObject = getCellElementObject(cell);

  if (onboardingArrow) {
    onboardingArrow.remove();
  }

  if (miniHelp) {
    miniHelp.remove();
    miniHelp = undefined;
  }

  miniHelp = getMiniHelpContent(cell);
  mainContainer?.append(miniHelp);

  if (!hasPerson(cell)) {
    if (!clickedCell) {
      return;
    }

    if (isDoor(cell) || isWindow(cell) || isTable(cell)) {
      return;
    }
  }

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

  if (miniHelp) {
    miniHelp.remove();
    miniHelp = undefined;
  }

  miniHelp = getMiniHelpContent();
  mainContainer?.append(miniHelp);
}

function updateState(gameFieldData: Cell[][], skipWinCheck = false) {
  const panickedTableCells = checkTableStates(gameFieldData);
  void updatePanicStates(gameFieldData, panickedTableCells);
  pubSubService.publish(PubSubEvent.UPDATE_SCORE, gameFieldData);
  const { hasWon } = getHappyStats(gameFieldData);

  if (hasWon && !skipWinCheck) {
    const submitKey = isOnboarding() ? TranslationKey.CONTINUE : TranslationKey.PLAY_AGAIN;
    createWinScreen(submitKey);

    pokiSdk.gameplayStop();
  }
}

export function generateGameFieldElement(gameFieldData: GameFieldData) {
  const gameField = createElement({
    cssClass: "game-field",
  });
  cellElements.length = 0;

  const onboardingData: OnboardingData | undefined = getOnboardingData();
  const isTableMiddle = onboardingData
    ? onboardingData.isTableMiddle
    : (rowIndex: number) => rowIndex === Math.ceil(gameFieldData.length / 2) - 1;

  gameFieldData.forEach((row, rowIndex) => {
    const rowElements: CellElementObject[] = [];
    const rowElem = createElement({
      cssClass: "row",
    });
    gameField.append(rowElem);

    row.forEach((cell, columnIndex) => {
      const isInMiddle = isTableMiddle(rowIndex);
      const cellElementObject = createCellElement(cell, isInMiddle);

      let arrow: HTMLElement | undefined;

      if (onboardingData?.arrow && onboardingData.arrow.row === rowIndex && onboardingData.arrow.column === columnIndex) {
        arrow = getOnboardingArrow(onboardingData.arrow.direction);
        cellElementObject.elem.append(arrow);
      }

      cellElementObject.elem.addEventListener("click", () => {
        cellClickHandler(rowIndex, columnIndex, arrow);
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

export async function updatePanicStates(gameFieldData: GameFieldData, panickedTableCells: Cell[]) {
  gameFieldData.flat().forEach((cell) => {
    const cellElementObject = getCellElementObject(cell);
    cellElementObject.elem.classList.remove("scary");
    cellElementObject.elem.classList.remove("scared");
    cellElementObject.elem.classList.remove("t13a");
    cellElementObject.elem.classList.remove("panic");
  });

  await sleep(0); // to trigger restart of tremble animation

  getAllGuests(gameFieldData).forEach((cell) => {
    const cellElementObject = getCellElementObject(cell);
    const hasPanic = cell.person.hasPanic || !isChair(cell);
    cellElementObject.elem.classList.toggle("panic", hasPanic);
  });

  panickedTableCells.forEach((cell) => {
    const cellElementObject = getCellElementObject(cell);
    cellElementObject.elem.classList.add("t13a");
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
