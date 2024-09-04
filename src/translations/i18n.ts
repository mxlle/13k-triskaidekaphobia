import { getShortLanguageName } from "../utils/language-util";
import { enTranslations } from "./en";
import { deTranslations } from "./de";

export const enum TranslationKey {
  INFO_TRISKAIDEKAPHOBIA,
  TRISKAIDEKAPHOBIA,
  WELCOME,
  GOAL,
  GOAL_2,
  START_GAME,
  NEW_GAME,
  WIN,
  CONTINUE,
  BACK,
  BIG_FEAR,
  SMALL_FEAR,
  INFO_BIG_FEAR,
  INFO_SMALL_FEAR,
  INFO_FOMO,
  INFO_PLACEHOLDER,
  INFO_CHAIR,
  INFO_TABLE,
  INFO_TABLE_OCCUPANCY,
  INFO_DECOR,
  INFO_EMPTY,
  INFO_PHOBIAS,
  DIFFICULTY,
  DIFFICULTY_EASY,
  DIFFICULTY_MEDIUM,
  DIFFICULTY_HARD,
  DIFFICULTY_EXTREME,
  MOVES,
}

function getTranslationRecords(): Record<TranslationKey, string> {
  if (isGermanLanguage()) {
    return deTranslations;
  }

  return enTranslations;
}

export function isGermanLanguage() {
  return getShortLanguageName(navigator.language) === "de";
}

export function getTranslation(key, ...args) {
  const language = isGermanLanguage() ? "de" : "en";

  document.documentElement.setAttribute("lang", language);

  let translation = getTranslationRecords()[key];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const regex = new RegExp(`\\{${i}\\}`, "g");
    translation = translation.replace(regex, arg);
  }

  return translation;
}
