import "./game-field.scss";

import { createButton, createElement } from "../../utils/html-utils";
import { moveGuest, newGame } from "../../logic/game-logic";
import { Cell, GameFieldData, hasPerson, isChair, isSameCell, isTable } from "../../types";
import { createWinScreen } from "../win-screen/win-screen";
import { createCellElement, updateCellOccupancy } from "./cell-component";
import { getTranslation, TranslationKey } from "../../translations/i18n";
import { globals } from "../../globals";
import { requestAnimationFrameWithTimeout } from "../../utils/promise-utils";
import { getGameFieldData } from "../../logic/initialize";
import { checkTableStates, getAllGuests, getHappyStats } from "../../logic/checks";
import { PubSubEvent, pubSubService } from "../../utils/pub-sub-service";
import { handlePokiCommercial, pokiSdk } from "../../poki-integration";
import { getOnboardingData, OnboardingData, wasOnboarding } from "../../logic/onboarding";
import { getMiniHelpContent } from "../help/help";
import { getOnboardingArrow } from "../onboarding/onboarding-components";
import { calculateScore } from "../../logic/score";

let mainContainer: HTMLElement | undefined;
let gameFieldElem: HTMLElement | undefined;
let miniHelp: HTMLElement | undefined;
let clickedCell: Cell | undefined;
let lastClickedCell: Cell | undefined;
let hasMadeFirstMove = false;
let moves: number = 0;
const cellElements: HTMLElement[][] = [];

const TIMEOUT_BETWEEN_GAMES = 300;
const TIMEOUT_CELL_APPEAR = 30;

export const enum CssClass {
  SELECTING = "selecting",
  SELECTED = "selected",
  PANIC = "panic",
  SCARED = "scared",
  SCARY = "scary",
  T13A = "t13a",
  P_T13A = "p-t13a",
  HAS_PERSON = "has-person",
  HAS_LEFT = "has-left",
  HAS_RIGHT = "has-right",
}

export async function initializeEmptyGameField() {
  document.body.classList.remove(CssClass.SELECTING);

  const baseData = getGameFieldData(true);

  if (gameFieldElem) {
    console.error("initialize function should only be called once");
    return;
  }

  gameFieldElem = generateGameFieldElement(baseData);

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
  document.body.classList.remove(CssClass.SELECTING);
  hasMadeFirstMove = false;
  clickedCell = undefined;
  lastClickedCell = undefined;
  moves = 0;

  if (globals.gameFieldData.length && gameFieldElem) {
    // reset old game field
    pubSubService.publish(PubSubEvent.UPDATE_SCORE, { score: 0, moves: 0 });
    await cleanGameField(globals.gameFieldData);
    await handlePokiCommercial();
    await requestAnimationFrameWithTimeout(TIMEOUT_BETWEEN_GAMES);

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
    await requestAnimationFrameWithTimeout(TIMEOUT_BETWEEN_GAMES);
  }

  await initializePersonsOnGameField(globals.gameFieldData);

  updateState(globals.gameFieldData);
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

  updateMiniHelp();
}

function cellClickHandler(rowIndex: number, columnIndex: number, onboardingArrow?: HTMLElement) {
  if (!hasMadeFirstMove) {
    hasMadeFirstMove = true;
    pokiSdk.gameplayStart();
  }

  const cell = globals.gameFieldData[rowIndex][columnIndex];

  if (onboardingArrow) {
    onboardingArrow.remove();
  }

  if (!hasPerson(cell) && lastClickedCell && isSameCell(cell, lastClickedCell)) {
    updateMiniHelp();
    lastClickedCell = undefined;
  } else {
    updateMiniHelp(cell);
    lastClickedCell = cell;
  }

  if (!hasPerson(cell)) {
    if (!clickedCell || isTable(cell)) {
      return;
    }
  }

  if (clickedCell) {
    const clickedCellElement = getCellElement(clickedCell);

    if (isSameCell(clickedCell, cell)) {
      resetSelection(cell);
      updateStateForSelection(globals.gameFieldData, clickedCell);
      return;
    }

    if (hasPerson(cell)) {
      clickedCellElement.classList.remove(CssClass.SELECTED);
      clickedCell = cell;
      updateStateForSelection(globals.gameFieldData, clickedCell);
      return;
    }

    moveGuest(clickedCell, cell);
    updateCellOccupancy(clickedCell, clickedCellElement);
    updateCellOccupancy(cell, getCellElement(cell));
    moves++;
    const hasWon = updateState(globals.gameFieldData);
    resetSelection(cell, !hasWon);
  } else {
    clickedCell = cell;
    updateStateForSelection(globals.gameFieldData, clickedCell);
  }

  document.body.classList.toggle(CssClass.SELECTING, !!clickedCell);
}

export function getCellElement(cell: Cell): HTMLElement {
  return cellElements[cell.row]?.[cell.column];
}

function resetSelection(cell: Cell, keepMiniHelp = false) {
  if (clickedCell) {
    getCellElement(clickedCell).classList.remove(CssClass.SELECTED);
    clickedCell = undefined;
  }

  getCellElement(cell).classList.remove(CssClass.SELECTED);

  document.body.classList.remove(CssClass.SELECTING);

  updateMiniHelp(keepMiniHelp ? cell : undefined);
}

function updateMiniHelp(cell?: Cell) {
  if (miniHelp) {
    miniHelp.remove();
    miniHelp = undefined;
  }

  miniHelp = getMiniHelpContent(cell);
  mainContainer?.append(miniHelp);
}

function updateState(gameFieldData: Cell[][], skipWinCheck = false): boolean {
  const panickedTableCells = checkTableStates(gameFieldData);
  void updatePanicStates(gameFieldData, panickedTableCells);
  const score = calculateScore(gameFieldData, moves);
  pubSubService.publish(PubSubEvent.UPDATE_SCORE, { score, moves });
  const { hasWon } = getHappyStats(gameFieldData);

  if (hasWon && !skipWinCheck) {
    createWinScreen(score);

    pokiSdk.gameplayStop();
  }

  return hasWon;
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
    const rowElements: HTMLElement[] = [];
    const rowElem = createElement({
      cssClass: "row",
    });
    gameField.append(rowElem);

    row.forEach((cell, columnIndex) => {
      const isInMiddle = isTableMiddle(rowIndex);
      const leftNeighbor = columnIndex > 0 ? gameFieldData[rowIndex][columnIndex - 1] : undefined;
      const isOnTheRightOfATable = leftNeighbor ? isTable(leftNeighbor) : false;
      const cellElement = createCellElement(cell, isInMiddle, isOnTheRightOfATable);

      let arrow: HTMLElement | undefined;

      if (onboardingData?.arrow && onboardingData.arrow.row === rowIndex && onboardingData.arrow.column === columnIndex) {
        arrow = getOnboardingArrow(onboardingData.arrow.direction);
        cellElement.append(arrow);
      }

      cellElement.addEventListener("click", () => {
        cellClickHandler(rowIndex, columnIndex, arrow);
      });

      rowElem.append(cellElement);
      rowElements.push(cellElement);
    });

    cellElements.push(rowElements);
  });

  return gameField;
}

export async function initializePersonsOnGameField(gameFieldData: GameFieldData) {
  const persons = getAllGuests(gameFieldData);

  for (let i = 0; i < persons.length; i++) {
    const cell = persons[i];
    const cellElement = getCellElement(cell);
    cellElement.append(cell.person.personElement);
    updateCellOccupancy(cell, cellElement);
    await requestAnimationFrameWithTimeout(TIMEOUT_CELL_APPEAR);
  }
}

export async function cleanGameField(gameFieldData: GameFieldData) {
  gameFieldData
    .flat()
    .filter(isTable)
    .forEach((tableCell) => {
      const tableCellElement = getCellElement(tableCell);
      tableCellElement.classList.remove(CssClass.T13A, CssClass.HAS_LEFT, CssClass.HAS_RIGHT);
    });

  const persons = getAllGuests(gameFieldData);

  for (let i = 0; i < persons.length; i++) {
    const cell = persons[i];
    const cellElement = getCellElement(cell);
    cellElement.innerHTML = "";
    cellElement.classList.remove(CssClass.HAS_PERSON, CssClass.PANIC, CssClass.P_T13A, CssClass.SELECTED, CssClass.SCARY, CssClass.SCARED);
    await requestAnimationFrameWithTimeout(TIMEOUT_CELL_APPEAR);
  }
}

export async function updatePanicStates(gameFieldData: GameFieldData, panickedTableCells: Cell[]) {
  gameFieldData.flat().forEach((cell) => {
    const cellElement = getCellElement(cell);
    cellElement.classList.remove(CssClass.PANIC, CssClass.P_T13A, CssClass.SCARY, CssClass.SCARED, CssClass.T13A);
  });

  await requestAnimationFrameWithTimeout(0); // to trigger restart of tremble animation

  getAllGuests(gameFieldData).forEach((cell) => {
    const cellElement = getCellElement(cell);
    const hasPanic = cell.person.hasPanic || !isChair(cell) || cell.person.triskaidekaphobia;
    cellElement.classList.toggle(CssClass.PANIC, hasPanic);
    cellElement.classList.toggle(CssClass.P_T13A, cell.person.triskaidekaphobia && !cell.person.hasPanic);
  });

  panickedTableCells.forEach((cell) => {
    const cellElement = getCellElement(cell);
    cellElement.classList.add(CssClass.T13A);
  });
}

export function updateStateForSelection(gameFieldData: GameFieldData, selectedCell: Cell | undefined) {
  gameFieldData.flat().forEach((cell) => {
    const cellElement = getCellElement(cell);
    cellElement.classList.remove(CssClass.SCARY, CssClass.SCARED);
  });

  if (!selectedCell) {
    return;
  }

  const selectedCellElement = getCellElement(selectedCell);

  selectedCellElement.classList.add(CssClass.SELECTED);

  if (!hasPerson(selectedCell)) {
    return;
  }

  selectedCell.person.afraidOf.forEach((afraidOf) => {
    getCellElement(afraidOf).classList.add(CssClass.SCARY);
  });

  selectedCell.person.makesAfraid.forEach((makesAfraid) => {
    getCellElement(makesAfraid).classList.add(CssClass.SCARED);
  });
}
