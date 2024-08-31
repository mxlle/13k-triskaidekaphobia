import "./win-screen.scss";

import { createDialog, Dialog } from "../dialog/dialog";
import { createButton, createElement } from "../../utils/html-utils";
import { getTranslation, TranslationKey } from "../../translations/i18n";
import { newGame } from "../../logic/game-logic";
import { getOnboardingData, increaseOnboardingStepIfApplicable, isOnboarding } from "../../logic/onboarding";
import { difficulties, difficultyEmoji, getDifficultyText, setDifficulty } from "../../logic/difficulty";
import { globals } from "../../globals";

let winDialog: Dialog | undefined;
let difficultyElement: HTMLElement | undefined;

export function createWinScreen() {
  if (!winDialog) {
    const winContentElem = getWinScreenContent();

    winDialog = createDialog(winContentElem, getConfirmText(), undefined, true);
  } else {
    updateConfirmText();
  }

  difficultyElement?.classList.toggle("hidden", isOnboarding());

  winDialog.open().then((playAgain) => {
    if (playAgain) {
      increaseOnboardingStepIfApplicable();
      newGame();
    }
  });
}

function updateConfirmText() {
  winDialog?.changeSubmitText(getConfirmText());
}

function getConfirmText() {
  if (getOnboardingData()) {
    return getTranslation(TranslationKey.CONTINUE);
  }

  return getTranslation(TranslationKey.PLAY_AGAIN) + " " + difficultyEmoji[globals.difficulty];
}

function getWinScreenContent() {
  const winContentElem = createElement({
    text: getTranslation(TranslationKey.WIN),
    cssClass: "win-screen",
  });

  difficultyElement = createElement({
    cssClass: "difficulty",
  });

  winContentElem.append(difficultyElement);

  difficultyElement.append(
    ...difficulties.map((difficulty) => {
      return createButton({
        text: difficultyEmoji[difficulty] + " " + getDifficultyText(difficulty),
        onClick: () => {
          setDifficulty(difficulty);
          updateConfirmText();
        },
      });
    }),
  );

  return winContentElem;
}
