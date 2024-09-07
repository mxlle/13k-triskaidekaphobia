import { getRandomItem } from "./utils/array-utils";
import { isGermanLanguage } from "./translations/i18n";

export const ONBOARDING_PHOBIAS_EMOJIS = ["🦆", "👴", "🐙", "🐸", "🐶", "🐦", "💃", "🦋", "🐴", "🦐", "🐔"] as const;

export const OTHER_EMOJIS = ["🔢", "💰", "🎈", "🍌", "☀️", "📰", "🥇", "📚"] as const;

export const PHOBIAS_EMOJIS = [...ONBOARDING_PHOBIAS_EMOJIS, ...OTHER_EMOJIS];

export type Indices<T extends readonly any[]> = Exclude<Partial<T>["length"], T["length"]>;

export type OnboardingEmojiIndex = Indices<typeof ONBOARDING_PHOBIAS_EMOJIS>;
export type OtherEmojiIndex = Indices<typeof OTHER_EMOJIS>;

export type Phobia = (typeof ONBOARDING_PHOBIAS_EMOJIS)[OnboardingEmojiIndex] | (typeof OTHER_EMOJIS)[OtherEmojiIndex];

const PhobiaNameMap: Record<Phobia, string> = {
  "🦆": "Anatidaephobia",
  "👴": "Peladphobia",
  "🐙": "Chapodiphobia",
  "🐸": "Ranidaphobia",
  "🐶": "Cynophobia",
  "🐦": "Ornithophobia",
  "💃": "Chorophobia",
  "🦋": "Lepidopterophobia",
  "🐴": "Equinophobia",
  "🦐": "Ostraconophobia",
  "🐔": "Alektorophobia",
  "🔢": "Arithmophobia",
  "💰": "Plutophobia",
  "🎈": "Globophobia",
  "🍌": "Bananaphobia",
  "☀️": "Heliophobia",
  "📰": "Chloephobia",
  "🥇": "Aurophobia",
  "📚": "Bibliophobia",
};

export function getPhobiaName(phobia: Phobia | undefined): string {
  if (!phobia) {
    return "";
  }

  let phobiaName = PhobiaNameMap[phobia];

  if (process.env.GERMAN_ENABLED === "true") {
    if (isGermanLanguage()) {
      phobiaName = phobiaName.replace("phobia", "phobie");
    }
  }

  return phobiaName;
}

export const getRandomPhobia = (phobiaPool: Phobia[] = [...PHOBIAS_EMOJIS]): Phobia => {
  return getRandomItem(phobiaPool);
};

export function getRandomPhobiaExcluding(excluded: (Phobia | unknown)[], phobiaPool: Phobia[] = [...PHOBIAS_EMOJIS]): Phobia {
  const emojis = phobiaPool.filter((emoji) => !excluded.includes(emoji));
  return getRandomItem(emojis);
}
