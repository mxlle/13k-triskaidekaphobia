import { TranslationKey } from "./i18n";

export const deTranslations: Record<TranslationKey, string> = {
  [TranslationKey.INFO_TRISKAIDEKAPHOBIA]: "niemals <em>13</em> an einem Tisch",
  [TranslationKey.EXAMPLE_TRISKAIDEKAPHOBIA]: "<em class='t13a'>Triskaidekaphobie</em>: 13 dürfen nicht an einem Tisch sitzen.",
  [TranslationKey.WELCOME]: "Willkommen bei der Gesellschaft der Multiphobiker",
  [TranslationKey.GOAL]: "🏁 Platziere alle Emojis an den Tischen ohne ihre Phobien auszulösen.",
  [TranslationKey.START_GAME]: "Spiel starten",
  [TranslationKey.WIN]: "Gewonnen 🎉",
  [TranslationKey.PLAY_AGAIN]: "Nochmal spielen",
  [TranslationKey.CONTINUE]: "Weiter",
  [TranslationKey.CANCEL]: "Abbrechen",
  [TranslationKey.EXAMPLE_BIG_FEAR]: "Große <em>{0}</em>: {1} darf nicht am selben Tisch sitzen.",
  [TranslationKey.EXAMPLE_SMALL_FEAR]: "Kleine <em>{0}</em>: {1} darf nicht daneben oder gegenüber sitzen.",
  [TranslationKey.INFO_BIG_FEAR]: "keine {0} am selben Tisch",
  [TranslationKey.INFO_SMALL_FEAR]: "keine {0} daneben oder gegenüber",
  [TranslationKey.INFO_FOMO]: "einem Sitzplatz zugewiesen 🍽️",
  [TranslationKey.RULES]: "Regeln",
  [TranslationKey.RULES_CONTENT]: `🏁 Das Ziel ist es, alle Emojis an den Tischen zu platzieren, ohne dass sich jemand fürchtet.

😱 Emojis fürchten sich vor bestimmten anderen Emojis. Klicke auf ein Emoji, um zu sehen, vor wem sie sich fürchten.

1️⃣3️⃣🙀 Außerdem leiden alle Emojis an <em>Triskaidekaphobie</em>.

🚪 Die meisten Emojis sitzen bereits an den Tischen. Aber es könnte auch einige geben, die an der Tür warten.

😀 Wenn alle Emojis glücklich sind, hast du gewonnen! 🎉`,
  [TranslationKey.INFO_PLACEHOLDER]: "Wähle ein Emoji aus, um mehr darüber zu erfahren.",
  [TranslationKey.INFO_CHAIR]: "Ein Stuhl. Jemand kann hier sitzen.",
  [TranslationKey.INFO_TABLE]: "Tisch {0}",
  [TranslationKey.INFO_TABLE_OCCUPANCY]: "Belegung: {0}/{1} 🪑",
  [TranslationKey.INFO_DECOR]: "Dekoration",
  [TranslationKey.INFO_EMPTY]: "Leeres Feld. Jemand kann hier warten.",
};
