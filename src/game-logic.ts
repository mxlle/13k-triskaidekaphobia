import { getRandomItem } from "./utils/array-utils";
import { Cell, CellType, GameFieldData, Guest } from "./types";
import { Phobia, PHOBIAS_EMOJIS } from "./phobia";

export function newGame() {
  // resetGlobals();
  // initGameData();
  location.reload();
}

export function initGameData() {
  // console.warn("not implemented yet");
}

const getType = (typeOrObject: string | Cell) =>
  typeof typeOrObject === "string" ? typeOrObject : typeOrObject.type;

export const isTable = (typeOrObject: string | Cell) =>
  getType(typeOrObject) === CellType.TABLE;
export const isGuest = (typeOrObject: string | Cell) =>
  getType(typeOrObject) === CellType.GUEST;
export const isDoor = (typeOrObject: string | Cell) =>
  getType(typeOrObject) === CellType.DOOR;
export const isWindow = (typeOrObject: string | Cell) =>
  getType(typeOrObject) === CellType.WINDOW;
export const isChair = (typeOrObject: string | Cell) =>
  getType(typeOrObject) === CellType.CHAIR;

export function hasPerson(cell: Cell): cell is Guest {
  return !!cell.fear || !!cell.smallFear;
}

export function isSameCell(cell1: Cell, cell2: Cell) {
  return cell1.row === cell2.row && cell1.column === cell2.column;
}

const baseField = (() => {
  const { GUEST, EMPTY, TABLE, CHAIR, DOOR: DOOR_, WINDOW: WINDO } = CellType;
  return [
    [
      DOOR_,
      GUEST,
      EMPTY,
      EMPTY,
      EMPTY,
      EMPTY,
      EMPTY,
      EMPTY,
      EMPTY,
      EMPTY,
      WINDO,
    ],
    [
      EMPTY,
      EMPTY,
      EMPTY,
      CHAIR,
      EMPTY,
      EMPTY,
      EMPTY,
      CHAIR,
      EMPTY,
      EMPTY,
      EMPTY,
    ],
    [
      EMPTY,
      EMPTY,
      CHAIR,
      TABLE,
      CHAIR,
      EMPTY,
      CHAIR,
      TABLE,
      CHAIR,
      EMPTY,
      EMPTY,
    ],
    [
      EMPTY,
      EMPTY,
      CHAIR,
      TABLE,
      CHAIR,
      EMPTY,
      CHAIR,
      TABLE,
      CHAIR,
      EMPTY,
      EMPTY,
    ],
    [
      EMPTY,
      EMPTY,
      CHAIR,
      TABLE,
      CHAIR,
      EMPTY,
      CHAIR,
      TABLE,
      CHAIR,
      EMPTY,
      EMPTY,
    ],
    [
      EMPTY,
      EMPTY,
      CHAIR,
      TABLE,
      CHAIR,
      EMPTY,
      CHAIR,
      TABLE,
      CHAIR,
      EMPTY,
      EMPTY,
    ],
    [
      EMPTY,
      EMPTY,
      CHAIR,
      TABLE,
      CHAIR,
      EMPTY,
      CHAIR,
      TABLE,
      CHAIR,
      EMPTY,
      EMPTY,
    ],
    [
      EMPTY,
      EMPTY,
      CHAIR,
      TABLE,
      CHAIR,
      EMPTY,
      CHAIR,
      TABLE,
      CHAIR,
      EMPTY,
      EMPTY,
    ],
    [
      EMPTY,
      EMPTY,
      CHAIR,
      TABLE,
      CHAIR,
      EMPTY,
      CHAIR,
      TABLE,
      CHAIR,
      EMPTY,
      EMPTY,
    ],
    [
      EMPTY,
      EMPTY,
      EMPTY,
      CHAIR,
      EMPTY,
      EMPTY,
      EMPTY,
      CHAIR,
      EMPTY,
      EMPTY,
      EMPTY,
    ],
    [
      WINDO,
      EMPTY,
      EMPTY,
      EMPTY,
      EMPTY,
      EMPTY,
      EMPTY,
      EMPTY,
      EMPTY,
      EMPTY,
      WINDO,
    ],
  ];
})();

export function getGameFieldData() {
  const gameField: GameFieldData = [];
  for (let row = 0; row < baseField.length; row++) {
    const baseRow = baseField[row];
    const rowArray: Cell[] = [];
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

function getGameFieldObject(type: CellType, row: number, column: number): Cell {
  const obj: Cell = {
    type,
    row,
    column,
    content: type,
  };

  if (isChair(type) || isGuest(type)) {
    obj.content =
      Math.random() > 0.4 || isGuest(type) ? getRandomPhobia() : type;

    if (!isChair(obj.content)) {
      const fearTypeRandomValue = Math.random();

      if (fearTypeRandomValue > 0.4) {
        obj.fear = getRandomPhobiaExcluding([obj.content]);
      }

      if (fearTypeRandomValue < 0.6) {
        obj.smallFear = getRandomPhobiaExcluding([obj.content, obj.fear]);
      }
    }
  }

  if (isChair(type) || isTable(type)) {
    obj.tableIndex = column > 4 ? 1 : 0;
  }

  return obj;
}

export const getRandomPhobia = (): Phobia =>
  getRandomItem<Phobia>([...PHOBIAS_EMOJIS]);

export function getRandomPhobiaExcluding(
  excluded: (Phobia | unknown)[],
): Phobia {
  const emojis = PHOBIAS_EMOJIS.filter((emoji) => !excluded.includes(emoji));
  return getRandomItem(emojis);
}

export function moveGuest(fromCell: Cell, toCell: Cell) {
  const fromContent = fromCell.content;
  const fromFear = fromCell.fear;
  const fromSmallFear = fromCell.smallFear;
  fromCell.content = isGuest(fromCell) ? CellType.EMPTY : fromCell.type;
  fromCell.fear = undefined;
  fromCell.smallFear = undefined;
  fromCell.hasPanic = false;
  toCell.content = fromContent;
  toCell.fear = fromFear;
  toCell.smallFear = fromSmallFear;
  toCell.hasPanic = false;
}

export function checkTableStates(gameFieldData: GameFieldData) {
  const panickedTableCells: Cell[] = [];

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

  const allGuests = getAllGuests(gameFieldData);
  const afraidGuests = allGuests.filter((guest) => guest.hasPanic);
  allGuests.forEach((guest) => {
    guest.makesAfraid = afraidGuests.filter((otherGuest) =>
      otherGuest.afraidOf?.find((afraidOf) => isSameCell(afraidOf, guest)),
    );
  });

  return panickedTableCells;
}

function getScaryNeighbors(gameFieldData: GameFieldData, cell: Cell) {
  const neighbors = getNeighbors(gameFieldData, cell.row, cell.column);
  return neighbors.filter(
    (neighbor) => neighbor.content === cell.smallFear,
  ) as Guest[];
}

function getGuestsOnTable(
  gameFieldData: GameFieldData,
  tableIndex: number,
): Guest[] {
  return gameFieldData
    .flat()
    .filter(
      (cell): cell is Guest =>
        cell.tableIndex === tableIndex && hasPerson(cell),
    );
}

// get all 8 neighbors of a cell, plus the three cells on the other side of the table
function getNeighbors(
  gameFieldData: GameFieldData,
  row: number,
  column: number,
): Cell[] {
  const neighbors: Cell[] = [];

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

export function getAllGuests(gameFieldData: GameFieldData) {
  return gameFieldData.flat().filter(hasPerson);
}

export function getHappyGuests(gameFieldData: GameFieldData) {
  return getAllGuests(gameFieldData).filter((guest) => !guest.hasPanic);
}

export function getHappyStats(gameFieldData: GameFieldData) {
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

function getTableCells(gameFieldData: GameFieldData, tableIndex: number) {
  return gameFieldData
    .flat()
    .filter((cell) => isTable(cell) && cell.tableIndex === tableIndex);
}

function findGuestsInvolvedInDeadlock(gameFieldData: GameFieldData) {
  const allGuests = getAllGuests(gameFieldData).map((guest) => ({ ...guest }));
  const guestsWithBigFear = allGuests.filter((guest) => guest.fear);
  const guestsPotentiallyInvolvedInDeadlock: Guest[] = [];
  const scaryGuestsWithBigFear: Guest[] = [];
  const fearedAtLeastOnce: Phobia[] = [];

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

function pushCellIfNotInList(cell: Cell, list: Cell[]) {
  if (!list.find((c) => isSameCell(c, cell))) {
    list.push(cell);
  }
}

function pushPrimativeIfNotInList<T>(value: T, list: T[]) {
  if (!list.includes(value)) {
    list.push(value);
  }
}

function resolveDeadlock(
  gameFieldData: GameFieldData,
  guestsInvolvedInDeadlock: Guest[],
  fearedAtLeastOnce: Phobia[],
) {
  for (let i = 0; i < guestsInvolvedInDeadlock.length; i++) {
    const copyOfGuest = guestsInvolvedInDeadlock[i];
    const guest = gameFieldData[copyOfGuest.row][copyOfGuest.column];

    guest.fear = getRandomPhobiaExcluding([
      guest.content,
      ...fearedAtLeastOnce,
    ]);
    if (guest.fear) {
      fearedAtLeastOnce.push(guest.fear);
    } else {
      guest.smallFear = getRandomPhobia();
    }

    console.log("updated guest to resolve deadlock", copyOfGuest, guest);
  }
}
