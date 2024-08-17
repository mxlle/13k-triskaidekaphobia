import { getRandomItem } from "./utils/array-utils";
import { splitEmojis } from "./utils/emojis/emoji-util";
import { phobias } from "./utils/emojis/sets";

export function newGame() {
  // resetGlobals();
  // initGameData();
  location.reload();
}

export function initGameData() {
  console.warn("not implemented yet");
}

export function isTable(typeOrObject) {
  const type =
    typeof typeOrObject === "string" ? typeOrObject : typeOrObject.type;
  return type === TABLE;
}

export function isGuest(typeOrObject) {
  const type =
    typeof typeOrObject === "string" ? typeOrObject : typeOrObject.type;
  return type === GUEST;
}

export function isDoor(typeOrObject) {
  const type =
    typeof typeOrObject === "string" ? typeOrObject : typeOrObject.type;
  return type === DOOR_;
}

export function isChair(typeOrObject) {
  const type =
    typeof typeOrObject === "string" ? typeOrObject : typeOrObject.type;
  return type === CHAIR;
}

const GUEST = "👤";
const EMPTY = "";
const TABLE = "🟫";
const CHAIR = "🪑";
const DOOR_ = "🚪";
const WINDO = "🪟";

const baseField = [
  [DOOR_, GUEST, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, WINDO],
  [EMPTY, EMPTY, EMPTY, CHAIR, EMPTY, EMPTY, EMPTY, CHAIR, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, CHAIR, TABLE, CHAIR, EMPTY, CHAIR, TABLE, CHAIR, EMPTY, EMPTY],
  [EMPTY, EMPTY, CHAIR, TABLE, CHAIR, EMPTY, CHAIR, TABLE, CHAIR, EMPTY, EMPTY],
  [EMPTY, EMPTY, CHAIR, TABLE, CHAIR, EMPTY, CHAIR, TABLE, CHAIR, EMPTY, EMPTY],
  [EMPTY, EMPTY, CHAIR, TABLE, CHAIR, EMPTY, CHAIR, TABLE, CHAIR, EMPTY, EMPTY],
  [EMPTY, EMPTY, CHAIR, TABLE, CHAIR, EMPTY, CHAIR, TABLE, CHAIR, EMPTY, EMPTY],
  [EMPTY, EMPTY, CHAIR, TABLE, CHAIR, EMPTY, CHAIR, TABLE, CHAIR, EMPTY, EMPTY],
  [EMPTY, EMPTY, CHAIR, TABLE, CHAIR, EMPTY, CHAIR, TABLE, CHAIR, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, CHAIR, EMPTY, EMPTY, EMPTY, CHAIR, EMPTY, EMPTY, EMPTY],
  [WINDO, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, WINDO],
];

export function getGameFieldData() {
  const gameField = [];
  for (let i = 0; i < baseField.length; i++) {
    const baseRow = baseField[i];
    const row = [];
    for (let j = 0; j < baseRow.length; j++) {
      const baseCell = baseRow[j];

      row.push(getGameFieldObject(baseCell));
    }
    gameField.push(row);
  }

  return gameField;
}

function getGameFieldObject(type) {
  if (isChair(type) || isGuest(type)) {
    const content =
      Math.random() > 0.3 || isGuest(type) ? getRandomEmoji() : type;
    let fear = "";

    if (!isChair(content)) {
      do {
        fear = getRandomEmoji();
      } while (content === fear);
    }

    return {
      type,
      content,
      fear,
    };
  }

  return {
    type,
    content: type,
  };
}

function getRandomEmoji() {
  return getRandomItem(splitEmojis(phobias));
}
