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

export function getPhobiaName(
  phobia: Phobia,
  isGerman: boolean = false,
): string {
  let phobiaName = PhobiaNameMap[phobia];

  if (isGerman) {
    phobiaName = phobiaName.replace("phobia", "phobie");
  }

  return phobiaName;
}
