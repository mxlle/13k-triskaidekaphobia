import "./index.scss";

import { createButton, createElement } from "./utils/html-utils";
import {
  checkTableStates,
  getAllGuests,
  getGameFieldData,
  getGuestsOnTable,
  getHappyGuests,
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

let configDialog, scoreElement;

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
  // header.append(
  //   createButton({ text: "⚙️", onClick: openConfig, iconBtn: true }),
  // );

  scoreElement = createElement({
    cssClass: "score",
  });

  header.append(scoreElement);

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
  const happyGuests = getHappyGuests(gameFieldData);
  const totalGuests = getAllGuests(gameFieldData);
  const unhappyGuests = totalGuests.filter((g) => !happyGuests.includes(g));
  const unseatedGuests = totalGuests.filter((g) => g.tableIndex === undefined);
  const numHappyGuests = happyGuests.length - unseatedGuests.length;
  scoreElement.textContent = `${unseatedGuests.length}🚪 + ${unhappyGuests.length} 😱 + ${numHappyGuests} 😀 / ${totalGuests.length}`;

  if (numHappyGuests === totalGuests.length) {
    createDialog(
      createElement({
        text: getTranslation(TranslationKey.WIN),
        cssClass: "win-screen",
      }),
      getTranslation(TranslationKey.PLAY_AGAIN),
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
