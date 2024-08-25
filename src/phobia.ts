import { getRandomItem } from "./utils/array-utils";
import { CellType, isChair } from "./types";

export const PHOBIAS_EMOJIS = [
  "🔢",
  "🟡",
  "💰",
  "8️⃣",
  "🎈",
  "🧵️",
  "🪞",
  "👴",
  "🤡",
  "🍌",
  "☀️",
  "🦵",
  // "🩳",
  "🟣",
  "🧄",
  "📰",
  "🐸",
  "🐶",
  "🥇",
  "📚",
] as const;

export type Phobia = (typeof PHOBIAS_EMOJIS)[number];

const PhobiaNameMap: Record<Phobia, string> = {
  "🔢": "Arithmophobia",
  "🟡": "Xanthophobia",
  "💰": "Plutophobia",
  "8️⃣": "Octophobia",
  "🎈": "Globophobia",
  "🧵️": "Linonophobia",
  "🪞": "Eisoptrophobia",
  "👴": "Peladphobia",
  "🤡": "Coulrophobia",
  "🍌": "Bananaphobia",
  "☀️": "Heliophobia",
  "🦵": "Genuphobia",
  // "🩳": "Pantophobia",
  "🟣": "Porphyrophobia",
  "🧄": "Alliumphobia",
  "📰": "Chloephobia",
  "🐸": "Ranidaphobia",
  "🐶": "Cynophobia",
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

export const getRandomPhobia = (): Phobia => getRandomItem<Phobia>([...PHOBIAS_EMOJIS]);

export function getRandomPhobiaExcluding(excluded: (Phobia | unknown)[]): Phobia {
  const emojis = PHOBIAS_EMOJIS.filter((emoji) => !excluded.includes(emoji));
  return getRandomItem(emojis);
}
