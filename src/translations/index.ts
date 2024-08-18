import { getShortLanguageName } from "../utils/language-util";
import { getRandomItem } from "../utils/array-utils";

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
    en: "You win!",
    de: "Gewonnen!",
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
    en: "But {0} has <em>{1}</em> and is afraid if {2} sits at the same table.",
    de: "Aber {0} hat <em>{1}</em> und fürchtet sich, wenn {2} am selben Tisch sitzt.",
  },
  [TranslationKey.EXAMPLE_SMALL_FEAR]: {
    en: "Also, {0} has <em>{1}</em> and is afraid if {2} sits next to or across from them.",
    de: "{0} hat auch <em>{1}</em> und fürchtet sich, wenn {2} daneben oder gegenüber sitzt.",
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

1️⃣3️⃣🙀 Also all emojis suffer from <em>Triskaidekaphobia</em>.

😀 If all emojis are happy, you win! 🎉`,
    de: `🏁 Das Ziel ist es, alle Emojis an den Tischen zu platzieren.

🚪 Ein Emoji wartet an der Tür. Andere sind bereits an den Tischen platziert.

😱 Die Emojis haben Angst vor bestimmten anderen Emojis. Dabei wird zwischen zwei Fällen unterschieden: große und kleine Angst.
🍽️ Die große Angst wird bereits ausgelöst, wenn das Emoji am selben Tisch wie das Emoji sitzt, vor dem es Angst hat.
🪑 Die kleine Angst wird nur ausgelöst, wenn das Emoji neben oder gegenüber dem Emoji sitzt, vor dem es Angst hat (auch schräg gegenüber).

1️⃣3️⃣🙀 Außerdem haben alle Emojis <em>Triskaidekaphobie</em>!

😀 Wenn alle glücklich sind, gewinnst du!`,
  },
};

export const enum ListsOfTranslationsKey {
  FEAR,
  GREETING,
  TRISKAIDEKAPHOBIA,
}

const ListsOfTranslations = {
  [ListsOfTranslationsKey.FEAR]: {
    en: ["Oh no! {0}!!!", "Aaah, {0}!!!", "{0} all over. Why did I come?"],
    de: [
      "Oh nein! {0}!!!",
      "Aaah, {0}!!!",
      "Ach du Schreck!! {0}!!",
      "{0} überall. Warum bin ich nur gekommen?",
    ],
  },
  [ListsOfTranslationsKey.GREETING]: {
    en: [
      "Hello, I am {0}!",
      "Hi, I am {0}!",
      "Hey, I am {0}!",
      "Hi there, I am {0}!",
    ],
    de: ["Hallo, ich bin {0}!", "Hi, ich bin {0}!", "Hey, ich bin {0}!"],
  },
  [ListsOfTranslationsKey.TRISKAIDEKAPHOBIA]: {
    en: [
      "Oh no! My Triskaidekaphobia!",
      "When 13 dine together, the first to rise will be the first to die",
      "13 is an unlucky number",
      "I'm afraid of the number 13",
      "Aaaaaaaah! 13!",
    ],
    de: [
      "Oh nein! Meine Triskaidekaphobie!",
      "Wenn 13 zusammen essen, wird der erste, der aufsteht, der erste sein, der stirbt",
      "13 ist eine Unglückszahl",
      "Ich habe Angst vor der Zahl 13",
      "Aaaaaaaah! 13!",
    ],
  },
};

export function isGermanLanguage() {
  return getShortLanguageName(navigator.language) === "de";
}

export function getTranslation(key: TranslationKey, ...args) {
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

export function getRandomTranslationFromList(
  key: ListsOfTranslationsKey,
  ...args
) {
  let language = getShortLanguageName(navigator.language);

  language = language in ListsOfTranslations[key] ? language : "en";

  const speechList = ListsOfTranslations[key][language];
  let speech = getRandomItem<string>(speechList);

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const regex = new RegExp(`\\{${i}\\}`, "g");
    speech = speech.replace(regex, arg);
  }

  return speech;
}
