import "./win-screen.scss";

import { createDialog, Dialog } from "../dialog";
import { createElement } from "../../utils/html-utils";
import { getTranslation, TranslationKey } from "../../translations";
import { newGame } from "../../logic/game-logic";
import { increaseOnboardingStepIfApplicable } from "../../logic/onboarding";

let winDialog: Dialog | undefined;

export function createWinScreen(confirmKey: TranslationKey) {
  if (!winDialog) {
    winDialog = createDialog(
      createElement({
        text: getTranslation(TranslationKey.WIN),
        cssClass: "win-screen",
      }),
      getTranslation(confirmKey),
      undefined,
      true,
    );
  } else {
    winDialog.changeSubmitText(getTranslation(confirmKey));
  }

  winDialog.open().then((playAgain) => {
    if (playAgain) {
      increaseOnboardingStepIfApplicable();
      newGame();
    }
  });
}
