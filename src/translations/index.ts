import { getShortLanguageName } from "../utils/language-util";

export const enum TranslationKey {
  WELCOME,
  START_GAME,
  WIN,
  PLAY_AGAIN,
  CONTINUE,
  CANCEL,
  EXAMPLE,
  EXAMPLE_EMOJI,
  EXAMPLE_BIG_FEAR,
  EXAMPLE_SMALL_FEAR,
  RULES,
  RULES_CONTENT,
  ABOUT,
  INFO_EMPTY,
}

const Translation = {
  [TranslationKey.WELCOME]: {
    en: "Society of Multiphobics",
    de: "Gesellschaft der Multiphobiker",
  },
  [TranslationKey.START_GAME]: {
    en: "Start game",
    de: "Spiel starten",
  },
  [TranslationKey.WIN]: {
    en: "You win 🎉",
    de: "Gewonnen 🎉",
  },
  [TranslationKey.PLAY_AGAIN]: {
    en: "Play again",
    de: "Nochmal spielen",
  },
  [TranslationKey.CONTINUE]: {
    en: "Continue",
    de: "Weiter",
  },
  [TranslationKey.CANCEL]: {
    en: "Cancel",
    de: "Abbrechen",
  },
  [TranslationKey.EXAMPLE]: {
    en: "Example",
    de: "Beispiel",
  },
  [TranslationKey.EXAMPLE_EMOJI]: {
    en: "{0} wants to be seated at the table.",
    de: "{0} möchte am Tisch sitzen.",
  },
  [TranslationKey.EXAMPLE_BIG_FEAR]: {
    en: "{0} has <em>{1}</em> and is afraid if {2} sits at the same table.",
    de: "{0} hat <em>{1}</em> und fürchtet sich, wenn {2} am selben Tisch sitzt.",
  },
  [TranslationKey.EXAMPLE_SMALL_FEAR]: {
    en: "{0} has a bit of <em>{1}</em> and is afraid if {2} sits next to or across from them.",
    de: "{0} hat ein bisschen <em>{1}</em> und fürchtet sich, wenn {2} daneben oder gegenüber sitzt.",
  },
  [TranslationKey.RULES]: {
    en: "Rules",
    de: "Regeln",
  },
  [TranslationKey.RULES_CONTENT]: {
    en: `🏁 The goal is to seat all emojis at the tables without anybody being frightened.

😱 Emojis are afraid of certain other emojis. Click on an emoji to see who they are afraid of.

1️⃣3️⃣🙀 Also all emojis suffer from <em>Triskaidekaphobia</em>.

🚪 Most emojis are already seated at the tables. But there might also be some waiting at the door.

😀 If all emojis are happy, you win! 🎉`,
    de: `🏁 Das Ziel ist es, alle Emojis an den Tischen zu platzieren, ohne dass jemand Angst hat.

😱 Die Emojis haben Angst vor bestimmten anderen Emojis. Klicke auf ein Emoji, um zu sehen, vor wem es Angst hat.

1️⃣3️⃣🙀 Außerdem leiden alle Emojis unter <em>Triskaidekaphobie</em>!

🚪 Die meisten Emojis sitzen bereits an den Tischen. Aber es kann auch sein, dass einige noch an der Tür warten.

😀 Wenn alle glücklich sind, gewinnst du!`,
  },
  [TranslationKey.ABOUT]: {
    en: "About {0}",
    de: "Infos zu {0}",
  },
  [TranslationKey.INFO_EMPTY]: {
    en: "Select an emoji to learn more about it.",
    de: "Wähle ein Emoji aus, um mehr darüber zu erfahren.",
  },
};

export function isGermanLanguage() {
  return getShortLanguageName(navigator.language) === "de";
}

export function getTranslation(key, ...args) {
  let language = getShortLanguageName(navigator.language);

  language = language in Translation[key] ? language : "en";

  // language = "de";

  document.documentElement.setAttribute("lang", language);

  let translation = Translation[key][language];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const regex = new RegExp(`\\{${i}\\}`, "g");
    translation = translation.replace(regex, arg);
  }

  return translation;
}
