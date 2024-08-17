import "./index.scss";

import { createButton, createElement } from "./utils/html-utils";
import {
  checkTableStates,
  getGameFieldData,
  getGuestsOnTable,
  initGameData,
  newGame,
} from "./game-logic";
import { getTranslation, TranslationKey } from "./translations";
import { createDialog } from "./components/dialog";
import { PubSubEvent, pubSubService } from "./utils/pub-sub-service";
import {
  getGameField,
  moveGuest,
  updatePanicStates,
} from "./components/game-field";

let configDialog;

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

function init() {
  initGameData();

  const header = createElement({
    tag: "header",
  });
  header.append(
    createButton({ text: "🔄", onClick: onNewGameClick, iconBtn: true }),
  );
  header.append(
    createElement({
      tag: "h1",
      text: `${getTranslation(TranslationKey.WELCOME)}`,
    }),
  );
  header.append(
    createButton({ text: "⚙️", onClick: openConfig, iconBtn: true }),
  );

  document.body.append(header);

  function cellClickHandler(cell, i, j) {
    if (clickedCell) {
      moveGuest(clickedCell, cell);
      clickedCell.elem.classList.remove("selected");
      cell.elem.classList.remove("selected");
      clickedCell = undefined;
      document.body.classList.remove("selecting");
      updateState(gameFieldData);
    } else {
      clickedCell = cell;
      document.body.classList.add("selecting");
    }
  }

  const gameFieldData = getGameFieldData();
  const gameField = getGameField(gameFieldData, cellClickHandler);
  document.body.append(gameField);

  updateState(gameFieldData);
}

function updateState(gameFieldData) {
  checkTableStates(gameFieldData);
  updatePanicStates(gameFieldData);
}

// INIT
init();
