import "./index.scss";

import { createButton, createElement } from "./utils/html-utils";
import { initGameData, newGame } from "./game-logic";
import { getTranslation, TranslationKey } from "./translations";
import { createDialog, Dialog } from "./components/dialog";
import { PubSubEvent, pubSubService } from "./utils/pub-sub-service";
import { createEmptyGameField, createGameField } from "./components/game-field";
import { initAudio, togglePlayer } from "./audio/music-control";
import { getLocalStorageItem, LocalStorageKey } from "./utils/local-storage";
import { openHelp } from "./components/help/help";

let configDialog: Dialog;

export let scoreElement: HTMLElement;

const initializeMuted = getLocalStorageItem(LocalStorageKey.MUTED) === "true";

function onNewGameClick() {
  newGame();
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

  const btnContainer = createElement({
    cssClass: "btn-container",
  });

  btnContainer.append(
    createButton({ text: "🔄", onClick: onNewGameClick, iconBtn: true }),
  );

  const muteButton = createButton({
    text: initializeMuted ? "🔇" : "🔊",
    onClick: (event: MouseEvent) => {
      const isActive = togglePlayer();
      (event.target as HTMLElement).textContent = isActive ? "🔊" : "🔇";
    },
    iconBtn: true,
  });

  btnContainer.append(muteButton);

  btnContainer.append(
    createButton({ text: "❓", onClick: openHelp, iconBtn: true }),
  );

  header.append(btnContainer);

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
    text: "? 🚪 + ? 😱 + ? 😀 / ?",
  });

  header.append(scoreElement);

  document.body.append(header);

  createEmptyGameField();

  pubSubService.subscribe(PubSubEvent.NEW_GAME, () => {
    createGameField();
  });
}

// INIT
void initAudio(initializeMuted);
init();
