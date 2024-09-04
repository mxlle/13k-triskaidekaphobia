import "./index.scss";

import { createButton, createElement } from "./utils/html-utils";
import { newGame } from "./logic/game-logic";
import { createDialog, Dialog } from "./components/dialog/dialog";
import { PubSubEvent, pubSubService } from "./utils/pub-sub-service";
import { initializeEmptyGameField, startNewGame } from "./components/game-field/game-field";
import { initAudio, togglePlayer } from "./audio/music-control";
import { getLocalStorageItem, LocalStorageKey } from "./utils/local-storage";
import { initPoki, pokiSdk } from "./poki-integration";
import { isOnboarding } from "./logic/onboarding";
import { globals } from "./globals";
import { getTranslation, TranslationKey } from "./translations/i18n";

let configDialog: Dialog;

let scoreElement: HTMLElement;

const initializeMuted = getLocalStorageItem(LocalStorageKey.MUTED) === "true";

function onNewGameClick() {
  pokiSdk.gameplayStop();
  newGame();
}

function openConfig() {
  if (!configDialog) {
    configDialog = createDialog(createElement({ text: "Config :-)" }), undefined, "Title :-)");
  }

  configDialog.open();
}

function init() {
  const header = createElement({
    tag: "header",
  });

  scoreElement = createElement({
    cssClass: "score",
  });

  header.append(scoreElement);

  const btnContainer = createElement({
    cssClass: "h-btns",
  });

  const muteButton = createButton({
    text: initializeMuted ? "🔇" : "🔊",
    onClick: (event: MouseEvent) => {
      const isActive = togglePlayer();
      (event.target as HTMLElement).textContent = isActive ? "🔊" : "🔇";
    },
    iconBtn: true,
  });

  btnContainer.append(muteButton);

  header.append(btnContainer);

  btnContainer.append(createButton({ text: "🔄", onClick: onNewGameClick, iconBtn: true }));

  document.body.append(header);

  if (isOnboarding()) {
    void startNewGame();
  } else {
    void initializeEmptyGameField();
  }

  pubSubService.subscribe(PubSubEvent.NEW_GAME, () => {
    void startNewGame();
  });

  pubSubService.subscribe(PubSubEvent.UPDATE_SCORE, ({ score, moves }) => {
    if (isOnboarding() || !globals.metaData) {
      scoreElement.textContent = "";
      return;
    }

    //  | Par: ${globals.metaData.minMoves}

    const scoreText = `${getTranslation(TranslationKey.MOVES)}: ${moves} | ${formatNumber(score)}⭐️`;
    scoreElement.textContent = scoreText;
  });
}

function formatNumber(num: number): string {
  return ("" + (10000 + num)).substring(1);
}

// INIT
initPoki(async () => {
  init();
  await initAudio(initializeMuted);
});
