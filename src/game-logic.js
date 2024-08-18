import { getRandomItem } from "./utils/array-utils";
import { splitEmojis } from "./utils/emojis/emoji-util";
import { phobias } from "./utils/emojis/sets";

const phobiaEmojis = splitEmojis(phobias);

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

export function isSameCell(cell1, cell2) {
  return cell1.row === cell2.row && cell1.column === cell2.column;
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

  const { guestsInvolvedInDeadlock, fearedAtLeastOnce } =
    findGuestsInvolvedInDeadlock(gameField);
  resolveDeadlock(gameField, guestsInvolvedInDeadlock, fearedAtLeastOnce);

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
        fear = getRandomEmojiExcluding([content]);
      }

      if (fearTypeRandomValue < 0.6) {
        smallFear = getRandomEmojiExcluding([content, fear]);
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

function getRandomEmoji(emojis = phobiaEmojis) {
  return getRandomItem(emojis);
}

function getRandomEmojiExcluding(excluded) {
  const emojis = phobiaEmojis.filter((emoji) => !excluded.includes(emoji));
  return getRandomItem(emojis);
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
      const alsoAfraidOf = getScaryNeighbors(gameFieldData, guest);
      afraidOf.push(...alsoAfraidOf);

      guest.hasPanic = isPanic || afraidOf.length > 0;
      guest.afraidOf = afraidOf;
    });
  }

  const otherGuestsInRoom = getAllGuests(gameFieldData).filter(
    (guest) => guest.tableIndex === undefined,
  );
  otherGuestsInRoom.forEach((guest) => {
    const afraidOf = getScaryNeighbors(gameFieldData, guest);
    guest.hasPanic = afraidOf.length > 0;
    guest.afraidOf = afraidOf;
  });

  return panickedTableCells;
}

function getScaryNeighbors(gameFieldData, cell) {
  const neighbors = getNeighbors(gameFieldData, cell.row, cell.column);
  return neighbors.filter((neighbor) => neighbor.content === cell.smallFear);
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

export function getHappyStats(gameFieldData) {
  const happyGuestList = getHappyGuests(gameFieldData);
  const totalGuestList = getAllGuests(gameFieldData);
  const unhappyGuestList = totalGuestList.filter(
    (g) => !happyGuestList.includes(g),
  );
  const unseatedGuestList = totalGuestList.filter(
    (g) => g.tableIndex === undefined,
  );
  const happyGuests = happyGuestList.length - unseatedGuestList.length;

  return {
    unseatedGuests: unseatedGuestList.length,
    unhappyGuests: unhappyGuestList.length,
    happyGuests,
    totalGuests: totalGuestList.length,
  };
}

function getTableCells(gameFieldData, tableIndex) {
  return gameFieldData
    .flat()
    .filter((cell) => isTable(cell) && cell.tableIndex === tableIndex);
}

function findGuestsInvolvedInDeadlock(gameFieldData) {
  const allGuests = getAllGuests(gameFieldData).map((guest) => ({ ...guest }));
  const guestsWithBigFear = allGuests.filter((guest) => guest.fear);
  const guestsPotentiallyInvolvedInDeadlock = [];
  const scaryGuestsWithBigFear = [];
  const fearedAtLeastOnce = [];

  guestsWithBigFear.forEach((guest) => {
    const afraidByMany =
      guestsWithBigFear.filter((g) => g.fear === guest.content).length > 1;

    const afraidOf = guestsWithBigFear.filter((g) => g.content === guest.fear);

    if (afraidByMany && afraidOf.length > 0) {
      pushCellIfNotInList(guest, guestsPotentiallyInvolvedInDeadlock);
      pushCellIfNotInList(guest, scaryGuestsWithBigFear);
    }

    if (afraidOf.length > 1) {
      pushCellIfNotInList(guest, guestsPotentiallyInvolvedInDeadlock);

      for (let i = 0; i < afraidOf.length; i++) {
        pushCellIfNotInList(afraidOf[i], scaryGuestsWithBigFear);
      }
    }

    if (afraidOf.length > 0) {
      for (let i = 0; i < afraidOf.length; i++) {
        pushPrimativeIfNotInList(afraidOf[i].content, fearedAtLeastOnce);
      }
    }
  });

  console.log(
    "guestsPotentiallyInvolvedInDeadlock",
    guestsPotentiallyInvolvedInDeadlock,
  );
  console.log("scaryGuestsWithBigFear", scaryGuestsWithBigFear);

  const guestsInvolvedInDeadlock = guestsPotentiallyInvolvedInDeadlock.filter(
    (guest) => {
      return scaryGuestsWithBigFear.includes(guest);
    },
  );

  console.log("guestsInvolvedInDeadlock", guestsInvolvedInDeadlock);
  console.log("fearedAtLeastOnce", fearedAtLeastOnce);

  return { guestsInvolvedInDeadlock, fearedAtLeastOnce };
}

function pushCellIfNotInList(cell, list) {
  if (!list.find((c) => isSameCell(c, cell))) {
    list.push(cell);
  }
}

function pushPrimativeIfNotInList(value, list) {
  if (!list.includes(value)) {
    list.push(value);
  }
}

function resolveDeadlock(
  gameFieldData,
  guestsInvolvedInDeadlock,
  fearedAtLeastOnce,
) {
  for (let i = 0; i < guestsInvolvedInDeadlock.length; i++) {
    const copyOfGuest = guestsInvolvedInDeadlock[i];
    const guest = gameFieldData[copyOfGuest.row][copyOfGuest.column];

    guest.fear = getRandomEmojiExcluding([guest.content, ...fearedAtLeastOnce]);
    if (guest.fear) {
      fearedAtLeastOnce.push(guest.fear);
    } else {
      guest.smallFear = getRandomEmoji();
    }

    console.log("updated guest to resolve deadlock", copyOfGuest, guest);
  }
}
