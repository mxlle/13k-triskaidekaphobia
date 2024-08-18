import "./index.scss";

import { createButton, createElement } from "./utils/html-utils";
import {
  checkTableStates,
  getGameFieldData,
  getHappyStats,
  getRandomPhobia,
  getRandomPhobiaExcluding,
  hasPerson,
  initGameData,
  isSameCell,
  moveGuest,
  newGame,
} from "./game-logic";
import { getTranslation, TranslationKey } from "./translations";
import { createDialog } from "./components/dialog";
import { PubSubEvent, pubSubService } from "./utils/pub-sub-service";
import {
  createCellElement,
  getGameField,
  updateCell,
  updatePanicStates,
  updateStateForSelection,
} from "./components/game-field";
import { Cell, CellType } from "./types";

let configDialog, helpDialog, scoreElement;

let clickedCell;

function onNewGameClick() {
  newGame();
  pubSubService.publish(PubSubEvent.NEW_GAME);
}

function openConfig() {
  if (!configDialog) {
    configDialog = createDialog(
      createElement({ text: "Config :-)" }),
      undefined,
      "Title :-)",
    );
  }

  configDialog.open();
}

function openHelp() {
  if (!helpDialog) {
    const helpContent = createElement({
      cssClass: "rules",
    });

    const helpText = createElement({
      text: getTranslation(TranslationKey.RULES_CONTENT),
    });

    const helpVisualization = createElement({
      cssClass: "visualization",
    });
    const content = getRandomPhobia();
    const fear = getRandomPhobiaExcluding([content]);
    const smallFear = getRandomPhobiaExcluding([content, fear]);
    const exampleCell: Cell = {
      type: CellType.CHAIR,
      content,
      fear,
      smallFear,
      row: -1,
      column: -1,
    };
    createCellElement(exampleCell);

    const exampleHeading = createElement({
      tag: "h3",
      text: getTranslation(TranslationKey.EXAMPLE),
    });
    const exampleText = createElement({
      text: `${getTranslation(TranslationKey.EXAMPLE_EMOJI, content)}
${getTranslation(TranslationKey.EXAMPLE_BIG_FEAR, content, fear)}
${getTranslation(TranslationKey.EXAMPLE_SMALL_FEAR, content, smallFear)}`,
    });

    helpVisualization.append(exampleHeading, exampleText, exampleCell.elem);

    helpContent.append(helpText, helpVisualization);

    helpDialog = createDialog(
      helpContent,
      undefined,
      getTranslation(TranslationKey.RULES),
    );
  }

  helpDialog.open();
}

function init() {
  initGameData();

  const header = createElement({
    tag: "header",
  });
  header.append(
    createButton({ text: "🔄", onClick: onNewGameClick, iconBtn: true }),
  );

  header.append(createButton({ text: "❓", onClick: openHelp, iconBtn: true }));

  header.append(
    createElement({
      tag: "h1",
      text: `${getTranslation(TranslationKey.WELCOME)}`,
    }),
  );
  // header.append(
  //   createButton({ text: "⚙️", onClick: openConfig, iconBtn: true }),
  // );

  scoreElement = createElement({
    cssClass: "score",
  });

  header.append(scoreElement);

  document.body.append(header);

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

  const gameFieldData = getGameFieldData();
  const gameField = getGameField(gameFieldData, cellClickHandler);
  document.body.append(gameField);

  updateState(gameFieldData);
}

function resetSelection(cell) {
  if (clickedCell) {
    clickedCell.elem.classList.remove("selected");
    clickedCell = undefined;
  }

  cell.elem.classList.remove("selected");

  document.body.classList.remove("selecting");
}

function updateState(gameFieldData) {
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

// INIT
init();
