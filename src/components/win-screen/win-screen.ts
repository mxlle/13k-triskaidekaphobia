import "./win-screen.scss";

import { createDialog, Dialog } from "../dialog/dialog";
import { createButton, createElement } from "../../utils/html-utils";
import { getTranslation, TranslationKey } from "../../translations/i18n";
import { newGame } from "../../logic/game-logic";
import { getOnboardingData, increaseOnboardingStepIfApplicable, isOnboarding } from "../../logic/onboarding";
import {
  difficulties,
  difficultyEmoji,
  getDifficultyHighscore,
  getDifficultyText,
  setDifficulty,
  setDifficultyHighscore,
} from "../../logic/difficulty";
import { globals } from "../../globals";

let winDialog: Dialog | undefined;
let difficultyElement: HTMLElement | undefined;

export function createWinScreen(score: number) {
  if (!winDialog) {
    const winContentElem = getWinScreenContent(score);

    winDialog = createDialog(winContentElem, getConfirmText(), undefined, true);
  } else {
    winDialog.recreateDialogContent(getWinScreenContent(score));
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

function getWinScreenContent(score: number) {
  setDifficultyHighscore(globals.difficulty, score);

  const winContentElem = createElement({
    cssClass: "win-screen",
  });

  winContentElem.innerHTML = getTranslation(TranslationKey.WIN) + "<br/>" + score + "⭐️";

  difficultyElement = createElement({
    cssClass: "difficulty",
  });

  winContentElem.append(difficultyElement);

  for (let difficulty of difficulties) {
    const inner = createElement({});

    const btn = createButton({
      text: difficultyEmoji[difficulty] + " " + getDifficultyText(difficulty),
      onClick: () => {
        setDifficulty(difficulty);
        updateConfirmText();
        winDialog?.close(true);
      },
    });

    const high = createElement({
      cssClass: "high",
      text: "" + getDifficultyHighscore(difficulty) + "⭐️",
    });

    inner.append(btn, high);
    difficultyElement.append(inner);
  }

  return winContentElem;
}
