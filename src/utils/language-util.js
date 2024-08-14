import { getRandomItem, removeDuplicates } from "./array-utils";

export function getLanguagesFromVoices(voices) {
  return removeDuplicates(
    voices
      .map((voice) => {
        return getShortLanguageName(voice.lang);
      })
      .filter((lang) => lang),
  );
}

export function getShortLanguageName(lang) {
  return lang?.slice(0, 2);
}

export function getDefaultLanguage(long = false) {
  return long ? navigator.language : getShortLanguageName(navigator.language);
}

export function getLanguagesWithoutDefault(
  languages,
  defaultLanguage = getDefaultLanguage(),
) {
  return languages.filter((lang) => lang !== defaultLanguage);
}

export function getLanguageForGame(languages, useNonDefaultLanguage = false) {
  if (useNonDefaultLanguage) {
    languages = getLanguagesWithoutDefault(languages);
  }

  return getRandomItem(languages);
}
