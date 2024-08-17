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

export function isWindow(typeOrObject) {
  const type =
    typeof typeOrObject === "string" ? typeOrObject : typeOrObject.type;
  return type === WINDO;
}

export function isChair(typeOrObject) {
  const type =
    typeof typeOrObject === "string" ? typeOrObject : typeOrObject.type;
  return type === CHAIR;
}

export function hasPerson(cell) {
  return !!cell.fear;
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
  for (let row = 0; row < baseField.length; row++) {
    const baseRow = baseField[row];
    const rowArray = [];
    for (let column = 0; column < baseRow.length; column++) {
      const baseCell = baseRow[column];

      rowArray.push(getGameFieldObject(baseCell, row, column));
    }
    gameField.push(rowArray);
  }

  return gameField;
}

function getGameFieldObject(type, row, column) {
  let content = type;
  let fear = "";
  let tableIndex = undefined;

  if (isChair(type) || isGuest(type)) {
    content = Math.random() > 0.4 || isGuest(type) ? getRandomEmoji() : type;

    if (!isChair(content)) {
      do {
        fear = getRandomEmoji();
      } while (content === fear);
    }
  }

  if (isChair(type)) {
    tableIndex = column > 4 ? 1 : 0;
  }

  return {
    type,
    content,
    fear,
    row,
    column,
    tableIndex,
  };
}

function getRandomEmoji() {
  return getRandomItem(splitEmojis(phobias));
}

export function checkTableStates(gameFieldData) {
  for (let i = 0; i < 2; i++) {
    const guests = getGuestsOnTable(gameFieldData, i);
    const isPanic = guests.length === 13;
    guests.forEach((guest) => {
      guest.hasPanic =
        isPanic ||
        guests.findIndex((otherGuest) => otherGuest.content === guest.fear) !==
          -1;
    });
  }
}

function getGuestsOnTable(gameFieldData, tableIndex) {
  return gameFieldData
    .flat()
    .filter((cell) => cell.tableIndex === tableIndex && hasPerson(cell));
}

export function getAllGuests(gameFieldData) {
  return gameFieldData.flat().filter(hasPerson);
}

export function getHappyGuests(gameFieldData) {
  return getAllGuests(gameFieldData).filter((guest) => !guest.hasPanic);
}
