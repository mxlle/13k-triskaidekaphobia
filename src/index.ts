import "./index.scss";

import { createButton, createElement } from "./utils/html-utils";
import { newGame } from "./logic/game-logic";
import { createDialog, Dialog } from "./components/dialog/dialog";
import { PubSubEvent, pubSubService } from "./utils/pub-sub-service";
import { initializeEmptyGameField, startNewGame } from "./components/game-field/game-field";
import { initAudio, togglePlayer } from "./audio/music-control";
import { getLocalStorageItem, LocalStorageKey } from "./utils/local-storage";
import { openHelp } from "./components/help/help";
import { getHappyStats } from "./logic/checks";
import { initPoki, pokiSdk } from "./poki-integration";
import { isOnboarding } from "./logic/onboarding";

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

  const btnContainer = createElement({
    cssClass: "h-btns",
  });

  btnContainer.append(createButton({ text: "🔄", onClick: onNewGameClick, iconBtn: true }));

  const muteButton = createButton({
    text: initializeMuted ? "🔇" : "🔊",
    onClick: (event: MouseEvent) => {
      const isActive = togglePlayer();
      (event.target as HTMLElement).textContent = isActive ? "🔊" : "🔇";
    },
    iconBtn: true,
  });

  btnContainer.append(muteButton);

  btnContainer.append(createButton({ text: "❓", onClick: openHelp, iconBtn: true }));

  header.append(btnContainer);

  // header.append(
  //   createElement({
  //     tag: "h1",
  //     text: `${getTranslation(TranslationKey.WELCOME)}`,
  //   }),
  // );
  // header.append(
  //   createButton({ text: "⚙️", onClick: openConfig, iconBtn: true }),
  // );

  const scoreBaseText = "? 🚪 + ? 😱 + ? 😀 / ?";

  scoreElement = createElement({
    cssClass: "score",
    text: scoreBaseText,
  });

  header.append(scoreElement);

  document.body.append(header);

  if (isOnboarding()) {
    void startNewGame();
  } else {
    void initializeEmptyGameField();
  }

  pubSubService.subscribe(PubSubEvent.NEW_GAME, () => {
    void startNewGame();
  });

  pubSubService.subscribe(PubSubEvent.UPDATE_SCORE, (gameFieldData) => {
    const { unseatedGuests, unhappyGuests, happyGuests, totalGuests } = getHappyStats(gameFieldData);
    scoreElement.textContent = totalGuests
      ? `${unseatedGuests}🚪 + ${unhappyGuests} 😱 + ${happyGuests} 😀 / ${totalGuests}`
      : scoreBaseText;
  });
}

// INIT
initPoki(async () => {
  init();
  await initAudio(initializeMuted);
});
