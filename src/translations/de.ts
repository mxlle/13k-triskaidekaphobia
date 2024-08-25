import { TranslationKey } from "./index";

export const deTranslations: Record<TranslationKey, string> = {
  [TranslationKey.WELCOME]: "Willkommen bei der Gesellschaft der Multiphobiker",
  [TranslationKey.GOAL]: "🏁 Das Ziel ist es, alle Emojis an den Tischen zu platzieren, ohne dass sich jemand fürchtet.",
  [TranslationKey.START_GAME]: "Spiel starten",
  [TranslationKey.WIN]: "Du hast gewonnen 🎉",
  [TranslationKey.PLAY_AGAIN]: "Nochmal spielen",
  [TranslationKey.CONTINUE]: "Weiter",
  [TranslationKey.CANCEL]: "Abbrechen",
  [TranslationKey.EXAMPLE_EMOJI]: "{0} möchte an den Tisch gesetzt werden.",
  [TranslationKey.EXAMPLE_BIG_FEAR]: "{0} hat <em>{1}</em> und fürchtet sich, wenn {2} am selben Tisch sitzt.",
  [TranslationKey.EXAMPLE_SMALL_FEAR]:
    "{0} hat ein bisschen <em>{1}</em> und fürchtet sich, wenn {2} neben oder gegenüber von ihnen sitzt.",
  [TranslationKey.RULES]: "Regeln",
  [TranslationKey.RULES_CONTENT]: `🏁 Das Ziel ist es, alle Emojis an den Tischen zu platzieren, ohne dass sich jemand fürchtet.

😱 Emojis fürchten sich vor bestimmten anderen Emojis. Klicke auf ein Emoji, um zu sehen, vor wem sie sich fürchten.

1️⃣3️⃣🙀 Außerdem leiden alle Emojis an <em>Triskaidekaphobie</em>.

🚪 Die meisten Emojis sitzen bereits an den Tischen. Aber es könnte auch einige geben, die an der Tür warten.

😀 Wenn alle Emojis glücklich sind, hast du gewonnen! 🎉`,
  [TranslationKey.ABOUT]: "Über {0}",
  [TranslationKey.INFO_PLACEHOLDER]: "Wähle ein Emoji aus, um mehr darüber zu erfahren.",
  [TranslationKey.INFO_CHAIR]: "Ich bin ein Stuhl. Jemand kann auf mir sitzen.",
  [TranslationKey.INFO_TABLE]: "Ich bin Tisch {0}",
  [TranslationKey.INFO_DECOR]: "Ich bin eine Dekoration",
  [TranslationKey.INFO_EMPTY]: "Ich bin ein leeres Feld. Jemand kann hier warten.",
  [TranslationKey.TARGET_CLICK]: "Klicke auf einen 🪑, um mich dorthin zu bewegen",
};
