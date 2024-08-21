import "./win-screen.scss";

import { createDialog, Dialog } from "../dialog";
import { createElement } from "../../utils/html-utils";
import { getTranslation, TranslationKey } from "../../translations";
import { newGame } from "../../logic/game-logic";

let winDialog: Dialog | undefined;

export function createWinScreen() {
  if (!winDialog) {
    winDialog = createDialog(
      createElement({
        text: getTranslation(TranslationKey.WIN),
        cssClass: "win-screen",
      }),
      getTranslation(TranslationKey.PLAY_AGAIN),
      undefined,
      true,
    );
  }

  winDialog.open().then((playAgain) => {
    if (playAgain) {
      newGame();
    }
  });
}
