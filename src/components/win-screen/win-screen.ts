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

export function createWinScreen(score: number, isComplete: boolean) {
  if (!winDialog) {
    const winContentElem = getWinScreenContent(score, isComplete);

    winDialog = createDialog(winContentElem, getConfirmText(isComplete));
  } else {
    winDialog.recreateDialogContent(getWinScreenContent(score, isComplete));
    updateConfirmText(isComplete);
  }

  difficultyElement?.classList.toggle("hidden", isOnboarding());

  winDialog.open().then((playAgain) => {
    if (playAgain) {
      if (isComplete) {
        increaseOnboardingStepIfApplicable();
      }
      newGame();
    }
  });
}

function updateConfirmText(isComplete: boolean) {
  winDialog?.changeSubmitText(getConfirmText(isComplete));
}

function getConfirmText(isComplete: boolean) {
  if (getOnboardingData()) {
    return isComplete ? getTranslation(TranslationKey.CONTINUE) : getTranslation(TranslationKey.NEW_GAME);
  }

  return getTranslation(TranslationKey.NEW_GAME) + " " + difficultyEmoji[globals.difficulty];
}

function getWinScreenContent(score: number, isComplete: boolean) {
  if (isComplete) {
    setDifficultyHighscore(globals.difficulty, score);
  }

  const winContentElem = createElement({
    cssClass: "win-screen",
  });

  if (isComplete) {
    const scoreText = isOnboarding() ? "" : "<br/>" + score + "⭐️";

    winContentElem.innerHTML = getTranslation(TranslationKey.WIN) + scoreText;
  } else {
    winContentElem.innerHTML = getTranslation(TranslationKey.NEW_GAME);
  }

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
        updateConfirmText(isComplete);
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
