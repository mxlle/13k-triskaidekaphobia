import "./game-field.scss";

import { createElement } from "../../utils/html-utils";
import {
  checkTableStates,
  getGameFieldData,
  getHappyStats,
  hasPerson,
  isChair,
  isDoor,
  isSameCell,
  isTable,
  isWindow,
  moveGuest,
  newGame,
} from "../../game-logic";
import { Cell, GameFieldData } from "../../types";
import {
  getTranslation,
  isGermanLanguage,
  TranslationKey,
} from "../../translations";
import { getPhobiaName } from "../../phobia";
import { createDialog } from "../dialog";
import { scoreElement } from "../../index";

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
    createDialog(
      createElement({
        text: getTranslation(TranslationKey.WIN),
        cssClass: "win-screen",
      }),
      getTranslation(TranslationKey.PLAY_AGAIN),
      undefined,
      true,
    )
      .open()
      .then((playAgain) => {
        if (playAgain) {
          newGame();
        }
      });
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

export function createCellElement(cell: Cell, isInMiddle: boolean = false) {
  const cellElem = createElement({
    cssClass: "cell",
  });

  if (hasPerson(cell)) {
    cellElem.classList.add("has-person");
  }

  if (isDoor(cell) || isWindow(cell)) {
    cellElem.classList.add("door");
  }

  if (isTable(cell)) {
    cellElem.classList.add("table");

    if (isInMiddle) {
      cellElem.classList.add("middle");

      const textElem = createElement({
        tag: "span",
        text: "13",
      });

      cellElem.append(textElem);
    }
  }

  if (isChair(cell)) {
    cellElem.classList.add("chair");
  }

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

  setCellFearTooltips(cell);
}

export function updateCell(cell: Cell) {
  cell.textElem!.textContent = cell.content;
  cell.fearElem!.textContent = cell.fear ?? null;
  cell.fearElem!.classList.toggle("hidden", !cell.fear);
  cell.smallFearElem!.textContent = cell.smallFear ?? null;
  cell.smallFearElem!.classList.toggle("hidden", !cell.smallFear);
  cell.elem!.classList.toggle("has-person", hasPerson(cell));
  cell.elem!.classList.toggle("panic", cell.hasPanic);
  setCellFearTooltips(cell);
}

function setCellFearTooltips(cell: Cell) {
  const isGerman = isGermanLanguage();
  const fearName = cell.fear ? getPhobiaName(cell.fear, isGerman) : "";
  const smallFearName = cell.smallFear
    ? getPhobiaName(cell.smallFear, isGerman)
    : "";
  cell.fearElem!.setAttribute("title", fearName);
  cell.smallFearElem!.setAttribute("title", smallFearName);
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
