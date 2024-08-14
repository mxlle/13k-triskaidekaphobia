import "./index.scss";

import { createButton, createElement } from "./utils/html-utils";
import { initGameData, newGame } from "./game-logic";
import { getTranslation, TranslationKey } from "./translations";
import { createDialog } from "./components/dialog";
import { PubSubEvent, pubSubService } from "./utils/pub-sub-service";
import { getRandomItem } from "./utils/array-utils";
import { splitEmojis } from "./utils/emojis/emoji-util";
import { phobias } from "./utils/emojis/sets";

let configDialog;

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

  const gameField = createElement({
    cssClass: "game-field",
  });

  document.body.append(gameField);

  const gameFieldData = getGameFieldData();

  gameFieldData.forEach((row, i) => {
    const rowElem = createElement({
      cssClass: "row",
    });
    gameField.append(rowElem);

    row.forEach((cell, j) => {
      const cellElem = createElement({
        cssClass: `cell${cell.type === TABLE ? " table" : ""}${cell.type === DOOR_ ? " door" : ""}`,
        text: cell.content,
        onClick: (event) => {
          event.target.classList.toggle("selected");
        },
      });
      rowElem.append(cellElem);

      if (cell.fear) {
        const fearElem = createElement({
          cssClass: "fear",
          text: cell.fear,
        });
        cellElem.append(fearElem);
      }
    });
  });
}

const GUEST = "👤";
const EMPTY = "";
const TABLE = "🟫";
const CHAIR = "🪑";
const DOOR_ = "🚪";
const WINDO = "🪟";

const baseField = [
  [DOOR_, GUEST, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, WINDO],
  [EMPTY, EMPTY, EMPTY, CHAIR, EMPTY, EMPTY, EMPTY, CHAIR, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, CHAIR, TABLE, CHAIR, EMPTY, CHAIR, TABLE, CHAIR, EMPTY, EMPTY],
  [EMPTY, EMPTY, CHAIR, TABLE, CHAIR, EMPTY, CHAIR, TABLE, CHAIR, EMPTY, EMPTY],
  [EMPTY, EMPTY, CHAIR, TABLE, CHAIR, EMPTY, CHAIR, TABLE, CHAIR, EMPTY, EMPTY],
  [EMPTY, EMPTY, CHAIR, TABLE, CHAIR, EMPTY, CHAIR, TABLE, CHAIR, EMPTY, EMPTY],
  [EMPTY, EMPTY, CHAIR, TABLE, CHAIR, EMPTY, CHAIR, TABLE, CHAIR, EMPTY, EMPTY],
  [EMPTY, EMPTY, CHAIR, TABLE, CHAIR, EMPTY, CHAIR, TABLE, CHAIR, EMPTY, EMPTY],
  [EMPTY, EMPTY, CHAIR, TABLE, CHAIR, EMPTY, CHAIR, TABLE, CHAIR, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, CHAIR, EMPTY, EMPTY, EMPTY, CHAIR, EMPTY, EMPTY, EMPTY],
  [WINDO, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, WINDO],
];

function getGameFieldData() {
  const gameField = [];
  for (let i = 0; i < baseField.length; i++) {
    const baseRow = baseField[i];
    const row = [];
    for (let j = 0; j < baseRow.length; j++) {
      const baseCell = baseRow[j];

      row.push(getGameFieldObject(baseCell));
    }
    gameField.push(row);
  }

  return gameField;
}

function getGameFieldObject(type) {
  if (type === CHAIR || type === GUEST) {
    const content =
      Math.random() > 0.3 || type === GUEST ? getRandomEmoji() : type;
    let fear = "";

    if (content !== CHAIR) {
      do {
        fear = getRandomEmoji();
      } while (content === fear);
    }

    return {
      type,
      content,
      fear,
    };
  }

  return {
    type,
    content: type,
  };
}

function getRandomEmoji() {
  return getRandomItem(splitEmojis(phobias));
}

// INIT
init();
