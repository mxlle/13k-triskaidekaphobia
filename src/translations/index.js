import { getShortLanguageName } from "../utils/language-util";

export const TranslationKey = {
  WELCOME: 0,
};

const Translation = {
  [TranslationKey.WELCOME]: {
    en: "Welcome",
    de: "Willkommen",
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
