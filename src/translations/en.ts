import { TranslationKey } from "./index";

export const enTranslations: Record<TranslationKey, string> = {
  [TranslationKey.WELCOME]: "Welcome to the Society of Multiphobics",
  [TranslationKey.GOAL]: "🏁 The goal is to seat all emojis at the tables without anybody being frightened.",
  [TranslationKey.START_GAME]: "Start game",
  [TranslationKey.WIN]: "You win 🎉",
  [TranslationKey.PLAY_AGAIN]: "Play again",
  [TranslationKey.CONTINUE]: "Continue",
  [TranslationKey.CANCEL]: "Cancel",
  [TranslationKey.EXAMPLE_EMOJI]: "{0} wants to be seated at the table.",
  [TranslationKey.EXAMPLE_BIG_FEAR]: "{0} has <em>{1}</em> and is afraid if {2} sits at the same table.",
  [TranslationKey.EXAMPLE_SMALL_FEAR]: "{0} has a bit of <em>{1}</em> and is afraid if {2} sits next to or across from them.",
  [TranslationKey.RULES]: "Rules",
  [TranslationKey.RULES_CONTENT]: `🏁 The goal is to seat all emojis at the tables without anybody being frightened.

😱 Emojis are afraid of certain other emojis. Click on an emoji to see who they are afraid of.

1️⃣3️⃣🙀 Also all emojis suffer from <em>Triskaidekaphobia</em>.

🚪 Most emojis are already seated at the tables. But there might also be some waiting at the door.

😀 If all emojis are happy, you win! 🎉`,
  [TranslationKey.ABOUT]: "About {0}",
  [TranslationKey.INFO_PLACEHOLDER]: "Select an emoji to learn more about it.",
  [TranslationKey.INFO_CHAIR]: "I'm a chair. Someone can sit on me.",
  [TranslationKey.INFO_TABLE]: "I'm table {0}",
  [TranslationKey.INFO_DECOR]: "I'm a decoration",
  [TranslationKey.INFO_EMPTY]: "I'm an empty field. Someone can wait here.",
  [TranslationKey.TARGET_CLICK]: "Click on a 🪑 to move me there",
};
