import { getRandomItem } from "./utils/array-utils";
import { CellType, isChair } from "./types";

export const ONBOARDING_PHOBIAS_EMOJIS = ["👴", "🤡", "🐸", "🐶", "💃", "🦋", "🐴", "🦐", "🐔"] as const;

export const OTHER_EMOJIS = ["🔢", "💰", "🎈", "🪞", "🍌", "☀️", "🧄", "📰", "🥇", "📚"] as const;

export const PHOBIAS_EMOJIS = [...ONBOARDING_PHOBIAS_EMOJIS, ...OTHER_EMOJIS];

export type Indices<T extends readonly any[]> = Exclude<Partial<T>["length"], T["length"]>;

export type OnboardingEmojiIndex = Indices<typeof ONBOARDING_PHOBIAS_EMOJIS>;
export type OtherEmojiIndex = Indices<typeof OTHER_EMOJIS>;

export type Phobia = (typeof ONBOARDING_PHOBIAS_EMOJIS)[OnboardingEmojiIndex] | (typeof OTHER_EMOJIS)[OtherEmojiIndex];

const PhobiaNameMap: Record<Phobia, string> = {
  "👴": "Peladphobia",
  "🤡": "Coulrophobia",
  "🐸": "Ranidaphobia",
  "🐶": "Cynophobia",
  "💃": "Chorophobia",
  "🦋": "Lepidopterophobia",
  "🐴": "Equinophobia",
  "🦐": "Ostraconophobia",
  "🐔": "Alektorophobia",
  "🔢": "Arithmophobia",
  "💰": "Plutophobia",
  "🎈": "Globophobia",
  "🪞": "Eisoptrophobia",
  "🍌": "Bananaphobia",
  "☀️": "Heliophobia",
  "🧄": "Alliumphobia",
  "📰": "Chloephobia",
  "🥇": "Aurophobia",
  "📚": "Bibliophobia",
};

export function getPhobiaName(phobia: Phobia | CellType.CHAIR | undefined, isGerman: boolean = false): string {
  if (!phobia) {
    return "";
  }

  if (isChair(phobia)) {
    return "FOMO";
  }

  let phobiaName = PhobiaNameMap[phobia];

  if (isGerman) {
    phobiaName = phobiaName.replace("phobia", "phobie");
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
