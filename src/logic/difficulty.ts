import { getTranslation, TranslationKey } from "../translations/i18n";
import { Settings } from "../types";
import { globals } from "../globals";
import { getLocalStorageItem, LocalStorageKey, setLocalStorageItem } from "../utils/local-storage";

export const enum Difficulty {
  EASY,
  MEDIUM,
  HARD,
  EXTREME,
}

export function setDifficulty(difficulty: Difficulty) {
  globals.settings = difficultySettings[difficulty];
  globals.difficulty = difficulty;
  setLocalStorageItem(LocalStorageKey.DIFFICULTY, difficulty.toString());
}

export const difficulties = [Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD, Difficulty.EXTREME];

export const difficultySettings: Record<Difficulty, Settings> = {
  [Difficulty.EASY]: {
    minAmount: 18,
    maxAmount: 20,
    chanceForBigFear: 0.3,
    chanceForSmallFear: 0.7,
    minInitialPanic: 3,
  },
  [Difficulty.MEDIUM]: {
    minAmount: 21,
    maxAmount: 24,
    chanceForBigFear: 0.4,
    chanceForSmallFear: 0.6,
    minInitialPanic: 4,
  },
  [Difficulty.HARD]: {
    minAmount: 25,
    maxAmount: 28,
    chanceForBigFear: 0.6,
    chanceForSmallFear: 0.7,
    minInitialPanic: 5,
  },
  [Difficulty.EXTREME]: {
    minAmount: 32,
    maxAmount: 32,
    chanceForBigFear: 0.7,
    chanceForSmallFear: 1,
    minInitialPanic: 6,
  },
};

export const difficultyEmoji: Record<Difficulty, string> = {
  [Difficulty.EASY]: "💚",
  [Difficulty.MEDIUM]: "🟡",
  [Difficulty.HARD]: "🟥",
  [Difficulty.EXTREME]: "💀",
};

export function getDifficultyText(difficulty: Difficulty): string {
  switch (difficulty) {
    case Difficulty.EASY:
      return getTranslation(TranslationKey.DIFFICULTY_EASY);
    case Difficulty.MEDIUM:
      return getTranslation(TranslationKey.DIFFICULTY_MEDIUM);
    case Difficulty.HARD:
      return getTranslation(TranslationKey.DIFFICULTY_HARD);
    case Difficulty.EXTREME:
      return getTranslation(TranslationKey.DIFFICULTY_EXTREME);
  }
}

export function getDifficultyHighscore(difficulty: Difficulty): number {
  const storedScore = getLocalStorageItem(getStorageKey(difficulty));

  if (!storedScore) return 0;

  return Number(storedScore);
}

export function setDifficultyHighscore(difficulty: Difficulty, score: number) {
  if (score > getDifficultyHighscore(difficulty)) {
    setLocalStorageItem(getStorageKey(difficulty), score.toString());
  }
}

function getStorageKey(difficulty: Difficulty): LocalStorageKey {
  switch (difficulty) {
    case Difficulty.EASY:
      return LocalStorageKey.DIFFICULTY_EASY;
    case Difficulty.MEDIUM:
      return LocalStorageKey.DIFFICULTY_MEDIUM;
    case Difficulty.HARD:
      return LocalStorageKey.DIFFICULTY_HARD;
    case Difficulty.EXTREME:
      return LocalStorageKey.DIFFICULTY_EXTREME;
  }
}
