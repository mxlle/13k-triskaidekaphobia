import "./game-field.scss";

import { createButton, createElement } from "../../utils/html-utils";
import { movePerson, newGame } from "../../logic/game-logic";
import { Cell, CellPositionWithTableIndex, findPerson, GameFieldData, hasPerson, isSameCell, isTable, PlacedPerson } from "../../types";
import { createWinScreen } from "../win-screen/win-screen";
import { createCellElement, updateCellOccupancy, updatePersonPanicState } from "./cell-component";
import { getTranslation, TranslationKey } from "../../translations/i18n";
import { globals } from "../../globals";
import { requestAnimationFrameWithTimeout } from "../../utils/promise-utils";
import { getGameFieldData, placePersonsInitially } from "../../logic/initialize";
import { checkTableStates, getHappyStats } from "../../logic/checks";
import { PubSubEvent, pubSubService } from "../../utils/pub-sub-service";
import { handlePokiCommercial, pokiSdk } from "../../poki-integration";
import { getOnboardingData, OnboardingData, wasOnboarding } from "../../logic/onboarding";
import { getMiniHelpContent } from "../help/help";
import { getOnboardingArrow } from "../onboarding/onboarding-components";
import { calculateScore } from "../../logic/score";
import initDragDrop from "../../utils/drag-drop";

let mainContainer: HTMLElement | undefined;
let gameFieldElem: HTMLElement | undefined;
let startButton: HTMLElement | undefined;
let miniHelp: HTMLElement | undefined;
let onboardingArrow: HTMLElement | undefined;
let clickedCell: PlacedPerson | undefined;
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
  CELL = "cell",
  IS_DRAGGING = "is-dragging",
  IS_DRAGGED = "is-dragged",
}

export async function initializeEmptyGameField() {
  document.body.classList.remove(CssClass.SELECTING);

  const baseData = getGameFieldData();

  if (gameFieldElem) {
    console.error("initialize function should only be called once");
    return;
  }

  gameFieldElem = generateGameFieldElement(baseData);

  startButton = createButton({
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
  startButton?.remove();
  hasMadeFirstMove = false;
  clickedCell = undefined;
  lastClickedCell = undefined;
  moves = 0;
  updateMiniHelp();

  if (globals.gameFieldData.length && gameFieldElem) {
    // reset old game field
    pubSubService.publish(PubSubEvent.UPDATE_SCORE, { score: 0, moves: 0 });
    await cleanGameField(globals.gameFieldData, globals.placedPersons);
    if (process.env.POKI_ENABLED === "true") await handlePokiCommercial();
    await requestAnimationFrameWithTimeout(TIMEOUT_BETWEEN_GAMES);

    if (wasOnboarding()) {
      console.debug("Was onboarding, removing game field");
      gameFieldElem.remove();
      gameFieldElem = undefined;
      globals.gameFieldData = [];
    }
  }

  console.debug("Starting new game, onboarding step", globals.onboardingStep);

  if (!globals.gameFieldData.length) {
    globals.gameFieldData = getGameFieldData();
  }

  globals.placedPersons = placePersonsInitially(globals.gameFieldData);

  if (!gameFieldElem) {
    gameFieldElem = generateGameFieldElement(globals.gameFieldData);
    appendGameField();
    await requestAnimationFrameWithTimeout(TIMEOUT_BETWEEN_GAMES);
  }

  await initializePersonsOnGameField(globals.placedPersons);

  addOnboardingArrowIfApplicable();

  updateState(globals.gameFieldData, globals.placedPersons);
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

function cellClickHandler(rowIndex: number, columnIndex: number) {
  if (!hasMadeFirstMove) {
    hasMadeFirstMove = true;
    if (process.env.POKI_ENABLED === "true") pokiSdk.gameplayStart();
  }

  const cell = globals.gameFieldData[rowIndex][columnIndex];

  if (!hasPerson(globals.placedPersons, cell) && lastClickedCell && isSameCell(cell, lastClickedCell)) {
    updateMiniHelp();
    lastClickedCell = undefined;
  } else {
    updateMiniHelp(cell);
    lastClickedCell = cell;
  }

  if (!hasPerson(globals.placedPersons, cell)) {
    if (!clickedCell || isTable(cell)) {
      return;
    }
  }

  const person = findPerson(globals.placedPersons, cell);

  if (clickedCell) {
    const clickedCellElement = getCellElement(clickedCell);

    if (isSameCell(clickedCell, cell)) {
      resetSelection(cell);
      updateStateForSelection(globals.placedPersons, clickedCell);
      return;
    }

    if (person) {
      clickedCell.personElement.classList.remove(CssClass.SELECTED);
      clickedCell = person;
      updateStateForSelection(globals.placedPersons, clickedCell);
      return;
    }

    const prevCell = {
      row: clickedCell.row,
      column: clickedCell.column,
      tableIndex: clickedCell.tableIndex,
    };
    movePerson(clickedCell, cell);
    updateCellOccupancy(prevCell, clickedCellElement);
    updateCellOccupancy(cell, getCellElement(cell));
    removeOnboardingArrowIfApplicable();
    moves++;
    const hasWon = updateState(globals.gameFieldData, globals.placedPersons);
    resetSelection(cell, !hasWon);
  } else {
    clickedCell = person;
    updateStateForSelection(globals.placedPersons, clickedCell);
  }

  document.body.classList.toggle(CssClass.SELECTING, !!clickedCell);
}

export function getCellElement(cell: CellPositionWithTableIndex): HTMLElement {
  return cellElements[cell.row]?.[cell.column];
}

function resetSelection(cell: Cell, keepMiniHelp = false) {
  if (clickedCell) {
    clickedCell = undefined;
  }

  const person = findPerson(globals.placedPersons, cell);

  if (person) {
    person.personElement.classList.remove(CssClass.SELECTED);
  }

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

function updateState(gameFieldData: Cell[][], placedPersons: PlacedPerson[], skipWinCheck = false): boolean {
  const panickedTableCells = checkTableStates(gameFieldData, placedPersons);
  void updatePanicStates(gameFieldData, placedPersons, panickedTableCells);
  const score = calculateScore(placedPersons, moves);
  pubSubService.publish(PubSubEvent.UPDATE_SCORE, { score, moves });
  const { hasWon } = getHappyStats(placedPersons);

  if (hasWon && !skipWinCheck) {
    createWinScreen(score, true);

    if (process.env.POKI_ENABLED === "true") pokiSdk.gameplayStop();
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

      cellElement.addEventListener("click", () => {
        cellClickHandler(rowIndex, columnIndex);
      });

      rowElem.append(cellElement);
      rowElements.push(cellElement);
    });

    cellElements.push(rowElements);
  });

  initDragDrop(
    gameField,
    CssClass.HAS_PERSON,
    CssClass.CELL,
    (dragEl) => {
      const cell = getElementCell(gameFieldData, dragEl);
      const person = findPerson(globals.placedPersons, cell);
      updateStateForSelection(globals.placedPersons, person);
      updateMiniHelp(cell);
      document.body.classList.toggle(CssClass.SELECTING, true);
      clickedCell = undefined; // todo - improve logic (needed because later faking a click)
      gameField.classList.add(CssClass.IS_DRAGGING);
      const personEl = getPersonElement(dragEl);
      personEl.classList.add(CssClass.IS_DRAGGED);
      return personEl.cloneNode(true) as HTMLElement;
    },
    (dragEl, dropEl, isTouch) => {
      gameField.classList.remove(CssClass.IS_DRAGGING);
      const dropCell = getElementCell(gameFieldData, dropEl);
      const dragCell = getElementCell(gameFieldData, dragEl);
      const personEl = getPersonElement(dragEl);
      personEl.classList.remove(CssClass.IS_DRAGGED);
      if (!isTable(dropCell) && !hasPerson(globals.placedPersons, dropCell)) {
        dragEl.click();
        dropEl.click();
      } else if (isTouch && dropCell === dragCell) {
        dragEl.click();
      }
    },
  );

  return gameField;
}

function getPersonElement(dragEl: HTMLElement): HTMLElement {
  return [...dragEl.children].find((el) => el.classList.contains("person")) as HTMLElement;
}

function getElementCell(gameFieldData: GameFieldData, el: HTMLElement): Cell | undefined {
  for (const row in cellElements) {
    const column = cellElements[row].indexOf(el);
    if (column !== -1) return gameFieldData[row][column];
  }
}

export async function initializePersonsOnGameField(persons: PlacedPerson[]) {
  for (let i = 0; i < persons.length; i++) {
    const person = persons[i];
    const cellElement = getCellElement(person);
    cellElement.innerHTML = "";
    updateCellOccupancy(person, cellElement);
    await requestAnimationFrameWithTimeout(TIMEOUT_CELL_APPEAR);
  }
}

function addOnboardingArrowIfApplicable() {
  const onboardingData = getOnboardingData();

  if (onboardingData?.arrow) {
    onboardingArrow = getOnboardingArrow(onboardingData.arrow.direction);
    const cell = globals.gameFieldData[onboardingData.arrow.row][onboardingData.arrow.column];
    const cellElement = getCellElement(cell);
    cellElement.append(onboardingArrow);
  }
}

function removeOnboardingArrowIfApplicable() {
  if (!onboardingArrow) {
    return;
  }
  const onboardingData = getOnboardingData();
  const hasOnboardingCellPerson = onboardingData?.arrow && hasPerson(globals.placedPersons, onboardingData.arrow);

  if (!hasOnboardingCellPerson) {
    onboardingArrow.remove();
    onboardingArrow = undefined;
  }
}

export async function cleanGameField(gameFieldData: GameFieldData, persons: PlacedPerson[]) {
  gameFieldData
    .flat()
    .filter(isTable)
    .forEach((tableCell) => {
      const tableCellElement = getCellElement(tableCell);
      tableCellElement.classList.remove(CssClass.T13A, CssClass.HAS_LEFT, CssClass.HAS_RIGHT);
    });

  for (let i = 0; i < persons.length; i++) {
    const cell = persons[i];
    const cellElement = getCellElement(cell);
    cellElement.innerHTML = "";
    cellElement.classList.remove(CssClass.HAS_PERSON);
    await requestAnimationFrameWithTimeout(TIMEOUT_CELL_APPEAR);
  }
}

export async function updatePanicStates(gameFieldData: GameFieldData, placedPersons: PlacedPerson[], panickedTableCells: Cell[]) {
  placedPersons.forEach((person) => {
    person.personElement.classList.remove(CssClass.PANIC, CssClass.P_T13A, CssClass.SCARY, CssClass.SCARED);
  });

  gameFieldData
    .flat()
    .filter(isTable)
    .forEach((cell) => {
      const cellElement = getCellElement(cell);
      cellElement.classList.remove(CssClass.T13A);
    });

  await requestAnimationFrameWithTimeout(0); // to trigger restart of tremble animation

  placedPersons.forEach((person) => {
    updatePersonPanicState(person);
  });

  panickedTableCells.forEach((cell) => {
    const cellElement = getCellElement(cell);
    cellElement.classList.add(CssClass.T13A);
  });
}

export function updateStateForSelection(placedPersons: PlacedPerson[], selectedPerson: PlacedPerson | undefined) {
  placedPersons.forEach((person) => {
    person.personElement.classList.remove(CssClass.SCARY, CssClass.SCARED, CssClass.SELECTED);
  });

  if (!selectedPerson) {
    return;
  }

  selectedPerson.personElement.classList.add(CssClass.SELECTED);

  selectedPerson.afraidOf.forEach((afraidOf) => {
    afraidOf.personElement.classList.add(CssClass.SCARY);
  });

  selectedPerson.makesAfraid.forEach((makesAfraid) => {
    makesAfraid.personElement.classList.add(CssClass.SCARED);
  });
}
