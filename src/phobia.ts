import { getRandomItem } from "./utils/array-utils";
import { CellType, isChair } from "./types";

export const ONBOARDING_PHOBIAS_EMOJIS = ["👴", "🤡", "🐸", "🐶", "💃", "🦋", "🐴", "🦐", "🐔"] as const;

export const PHOBIAS_EMOJIS = [...ONBOARDING_PHOBIAS_EMOJIS, "🔢", "💰", "🎈", "🪞", "🍌", "☀️", "🧄", "📰", "🥇", "📚"] as const;

export type Phobia = (typeof PHOBIAS_EMOJIS)[number];

const PhobiaNameMap: Record<Phobia, string> = {
  "🔢": "Arithmophobia",
  "💰": "Plutophobia",
  "🎈": "Globophobia",
  "🪞": "Eisoptrophobia",
  "👴": "Peladphobia",
  "🤡": "Coulrophobia",
  "🍌": "Bananaphobia",
  "☀️": "Heliophobia",
  "🧄": "Alliumphobia",
  "📰": "Chloephobia",
  "🐸": "Ranidaphobia",
  "🐶": "Cynophobia",
  "🥇": "Aurophobia",
  "📚": "Bibliophobia",
  "💃": "Chorophobia",
  "🦋": "Lepidopterophobia",
  "🐴": "Equinophobia",
  "🦐": "Ostraconophobia",
  "🐔": "Alektorophobia",
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
