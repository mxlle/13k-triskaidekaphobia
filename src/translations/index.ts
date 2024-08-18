import { getShortLanguageName } from "../utils/language-util";

export const enum TranslationKey {
  WELCOME,
  WIN,
  PLAY_AGAIN,
  CANCEL,
  EXAMPLE,
  EXAMPLE_EMOJI,
  EXAMPLE_BIG_FEAR,
  EXAMPLE_SMALL_FEAR,
  RULES,
  RULES_CONTENT,
}

const Translation = {
  [TranslationKey.WELCOME]: {
    en: "Society of Multiphobics",
    de: "Gesellschaft der Multiphobiker",
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
  [TranslationKey.EXAMPLE]: {
    en: "Example",
    de: "Beispiel",
  },
  [TranslationKey.EXAMPLE_EMOJI]: {
    en: "{0} wants to be seated at the table.",
    de: "{0} möchte am Tisch sitzen.",
  },
  [TranslationKey.EXAMPLE_BIG_FEAR]: {
    en: "But {0} is afraid if {1} sits at the same table.",
    de: "Aber {0} hat Angst, wenn {1} am selben Tisch sitzt.",
  },
  [TranslationKey.EXAMPLE_SMALL_FEAR]: {
    en: "And {0} is afraid if {1} sits next to or across from them.",
    de: "Und {0} hat Angst, wenn {1} daneben oder gegenüber sitzt.",
  },
  [TranslationKey.RULES]: {
    en: "Rules",
    de: "Regeln",
  },
  [TranslationKey.RULES_CONTENT]: {
    en: `🏁 The goal is to seat all emojis at the tables.

🚪 One emoji is waiting at the door. Others are already seated at the tables.

😱 Emojis are afraid of certain other emojis. There are two kinds of fears: big and small.
🍽️ The big fear triggers already if the emoji is seated on the same table as the emoji they are afraid of.
🪑 The small fear triggers only if the emoji is seated next to or across (also diagonally) from the emoji they are afraid of.

1️⃣3️⃣🙀 Also all emojis are afraid of the number 13.

😀 If all emojis are happy, you win! 🎉`,
    de: `🏁 Das Ziel ist es, alle Emojis an den Tischen zu platzieren.

🚪 Ein Emoji wartet an der Tür. Andere sind bereits an den Tischen platziert.

😱 Die Emojis haben Angst vor bestimmten anderen Emojis. Dabei wird zwischen zwei Fällen unterschieden: große und kleine Angst.
🍽️ Die große Angst wird bereits ausgelöst, wenn das Emoji am selben Tisch wie das Emoji sitzt, vor dem es Angst hat.
🪑 Die kleine Angst wird nur ausgelöst, wenn das Emoji neben oder gegenüber dem Emoji sitzt, vor dem es Angst hat (auch schräg gegenüber).

1️⃣3️⃣🙀 Außerdem haben alle Emojis Angst vor der Zahl 13.

😀 Wenn alle glücklich sind, gewinnst du!`,
  },
};

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
