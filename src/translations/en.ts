import { TranslationKey } from "./i18n";

export const enTranslations: Record<TranslationKey, string> = {
  [TranslationKey.INFO_TRISKAIDEKAPHOBIA]: "never <em>13</em> at a table",
  [TranslationKey.TRISKAIDEKAPHOBIA]: "Triskaidekaphobia",
  [TranslationKey.WELCOME]: "Welcome to the Society of Multiphobics",
  [TranslationKey.GOAL]: "🏁 Seat all emojis at the tables without triggering any phobias.",
  [TranslationKey.GOAL_2]: "🏁 What a mess! Re-sort the emojis at the tables until all phobias are resolved.",
  [TranslationKey.START_GAME]: "Start game",
  [TranslationKey.WIN]: "You win 🎉",
  [TranslationKey.PLAY_AGAIN]: "Play again",
  [TranslationKey.CONTINUE]: "Continue",
  [TranslationKey.CANCEL]: "Cancel",
  [TranslationKey.BIG_FEAR]: "Big {0}",
  [TranslationKey.SMALL_FEAR]: "Small {0}",
  [TranslationKey.INFO_BIG_FEAR]: "no {0} at the same table (A)",
  [TranslationKey.INFO_SMALL_FEAR]: "no {0} next to or opposite (B)",
  [TranslationKey.INFO_FOMO]: "assigned to a seat at the table 🍽️",
  [TranslationKey.INFO_PHOBIAS]: "Phobias: {0}",
  [TranslationKey.RULES]: "Rules",
  [TranslationKey.RULES_CONTENT]: `🏁 The goal is to seat all emojis at the tables without anybody being frightened.

😱 Emojis are afraid of certain other emojis. Click on an emoji to see who they are afraid of.

1️⃣3️⃣🙀 Also all emojis suffer from <em>Triskaidekaphobia</em>.

😀 If all emojis are happy, you win! 🎉`,
  [TranslationKey.INFO_PLACEHOLDER]: "Select an emoji to learn more about it.",
  [TranslationKey.INFO_CHAIR]: "A chair. Someone can sit here.",
  [TranslationKey.INFO_TABLE]: "Table {0}",
  [TranslationKey.INFO_TABLE_OCCUPANCY]: "Occupancy: {0}/{1} 🪑",
  [TranslationKey.INFO_DECOR]: "Decoration",
  [TranslationKey.INFO_EMPTY]: "Empty field. Someone can wait here.",
  [TranslationKey.DIFFICULTY]: "Difficulty",
  [TranslationKey.DIFFICULTY_EASY]: "Easy",
  [TranslationKey.DIFFICULTY_MEDIUM]: "Medium",
  [TranslationKey.DIFFICULTY_HARD]: "Hard",
  [TranslationKey.DIFFICULTY_EXTREME]: "Extreme",
};
