import { getShortLanguageName } from "../utils/language-util";
import { enTranslations } from "./en";
import { deTranslations } from "./de";

export const enum TranslationKey {
  INFO_TRISKAIDEKAPHOBIA,
  EXAMPLE_TRISKAIDEKAPHOBIA,
  WELCOME,
  GOAL,
  START_GAME,
  WIN,
  PLAY_AGAIN,
  CONTINUE,
  CANCEL,
  EXAMPLE_BIG_FEAR,
  EXAMPLE_SMALL_FEAR,
  INFO_BIG_FEAR,
  INFO_SMALL_FEAR,
  INFO_FOMO,
  RULES,
  RULES_CONTENT,
  INFO_PLACEHOLDER,
  INFO_CHAIR,
  INFO_TABLE,
  INFO_TABLE_OCCUPANCY,
  INFO_DECOR,
  INFO_EMPTY,
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
