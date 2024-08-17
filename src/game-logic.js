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
  return !!cell.fear || !!cell.smallFear;
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
  let smallFear = "";
  let tableIndex = undefined;

  if (isChair(type) || isGuest(type)) {
    content = Math.random() > 0.4 || isGuest(type) ? getRandomEmoji() : type;

    if (!isChair(content)) {
      const fearTypeRandomValue = Math.random();

      if (fearTypeRandomValue > 0.4) {
        do {
          fear = getRandomEmoji();
        } while (content === fear);
      }

      if (fearTypeRandomValue < 0.6) {
        do {
          smallFear = getRandomEmoji();
        } while (content === smallFear || fear === smallFear);
      }
    }
  }

  if (isChair(type) || isTable(type)) {
    tableIndex = column > 4 ? 1 : 0;
  }

  return {
    type,
    content,
    fear,
    smallFear,
    row,
    column,
    tableIndex,
  };
}

function getRandomEmoji() {
  return getRandomItem(splitEmojis(phobias));
}

export function moveGuest(fromCell, toCell) {
  const fromContent = fromCell.content;
  const fromFear = fromCell.fear;
  const fromSmallFear = fromCell.smallFear;
  fromCell.content = isGuest(fromCell) ? "" : fromCell.type;
  fromCell.fear = "";
  fromCell.smallFear = "";
  fromCell.hasPanic = false;
  toCell.content = fromContent;
  toCell.fear = fromFear;
  toCell.smallFear = fromSmallFear;
  toCell.hasPanic = false;
}

export function checkTableStates(gameFieldData) {
  const panickedTableCells = [];

  for (let tableIndex = 0; tableIndex < 2; tableIndex++) {
    const guests = getGuestsOnTable(gameFieldData, tableIndex);
    const isPanic = guests.length === 13;

    if (isPanic) {
      panickedTableCells.push(...getTableCells(gameFieldData, tableIndex));
    }

    guests.forEach((guest) => {
      const afraidOf = guests.filter(
        (otherGuest) => otherGuest.content === guest.fear,
      );
      const neighbors = getNeighbors(gameFieldData, guest.row, guest.column);
      const alsoAfraidOf = neighbors.filter(
        (neighbor) => neighbor.content === guest.smallFear,
      );
      afraidOf.push(...alsoAfraidOf);

      guest.hasPanic = isPanic || afraidOf.length > 0;
      guest.afraidOf = afraidOf;
    });
  }

  return panickedTableCells;
}

function getGuestsOnTable(gameFieldData, tableIndex) {
  return gameFieldData
    .flat()
    .filter((cell) => cell.tableIndex === tableIndex && hasPerson(cell));
}

// get all 8 neighbors of a cell, plus the three cells on the other side of the table
function getNeighbors(gameFieldData, row, column) {
  const neighbors = [];

  for (let rowIndex = row - 1; rowIndex <= row + 1; rowIndex++) {
    for (
      let columnIndex = column - 1;
      columnIndex <= column + 1;
      columnIndex++
    ) {
      if (rowIndex === row && columnIndex === column) {
        continue;
      }

      const cell = gameFieldData[rowIndex]?.[columnIndex];
      if (cell && hasPerson(cell)) {
        neighbors.push(cell);
      }
    }
  }

  // add the three cells on the other side of the table
  const tableIndex = gameFieldData[row][column].tableIndex;
  const additionalNeighbors = gameFieldData
    .flat()
    .filter(
      (cell) =>
        cell.tableIndex === tableIndex &&
        hasPerson(cell) &&
        cell.column !== column &&
        cell.row <= row + 1 &&
        cell.row >= row - 1 &&
        neighbors.indexOf(cell) === -1,
    );

  neighbors.push(...additionalNeighbors);

  return neighbors;
}

export function getAllGuests(gameFieldData) {
  return gameFieldData.flat().filter(hasPerson);
}

export function getHappyGuests(gameFieldData) {
  return getAllGuests(gameFieldData).filter((guest) => !guest.hasPanic);
}

function getTableCells(gameFieldData, tableIndex) {
  return gameFieldData
    .flat()
    .filter((cell) => isTable(cell) && cell.tableIndex === tableIndex);
}
