import { getShortLanguageName } from "../utils/language-util";

export const TranslationKey = {
  WELCOME: 0,
  WIN: 1,
  PLAY_AGAIN: 2,
  CANCEL: 3,
};

const Translation = {
  [TranslationKey.WELCOME]: {
    en: "Welcome",
    de: "Willkommen",
  },
  [TranslationKey.WIN]: {
    en: "You win 🎉",
    de: "Gewonnen 🎉",
  },
  [TranslationKey.PLAY_AGAIN]: {
    en: "Play again",
    de: "Nochmal spielen",
  },
  [TranslationKey.CANCEL]: {
    en: "Cancel",
    de: "Abbrechen",
  },
};

export function getTranslation(key, ...args) {
  let language = getShortLanguageName(navigator.language);

  language = language in Translation[key] ? language : "en";

  // language = "de";

  document.documentElement.setAttribute("lang", language);

  if (args.length > 0) {
    return Translation[key][language].replace("{0}", args[0]);
  }

  return Translation[key][language];
}
