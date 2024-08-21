import { getRandomItem } from "./utils/array-utils";
import { Cell, CellType, GameFieldData, OccupiedCell, Person } from "./types";
import { Phobia, PHOBIAS_EMOJIS } from "./phobia";
import { PubSubEvent, pubSubService } from "./utils/pub-sub-service";

export function newGame() {
  // resetGlobals();
  // initGameData();
  pubSubService.publish(PubSubEvent.NEW_GAME);
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

export function hasPerson(cell: Cell): cell is OccupiedCell {
  return !!cell.person;
}

export function isSameCell(cell1: Cell, cell2: Cell) {
  return cell1.row === cell2.row && cell1.column === cell2.column;
}

export const baseField = (() => {
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

export function getGameFieldData(skipAssignment: boolean = false) {
  const gameField: GameFieldData = [];
  for (let row = 0; row < baseField.length; row++) {
    const baseRow = baseField[row];
    const rowArray: Cell[] = [];
    for (let column = 0; column < baseRow.length; column++) {
      const baseCell = baseRow[column];

      rowArray.push(getGameFieldObject(baseCell, row, column, skipAssignment));
    }
    gameField.push(rowArray);
  }

  const { guestsInvolvedInDeadlock, fearedAtLeastOnce } =
    findGuestsInvolvedInDeadlock(gameField);
  resolveDeadlock(gameField, guestsInvolvedInDeadlock, fearedAtLeastOnce);

  return gameField;
}

function getGameFieldObject(
  type: CellType,
  row: number,
  column: number,
  skipAssignment: boolean,
): Cell {
  const obj: Cell = {
    type,
    row,
    column,
    content: type === CellType.GUEST ? CellType.EMPTY : type,
  };

  if (isChair(type) || isTable(type)) {
    obj.tableIndex = column > 4 ? 1 : 0;
  }

  if (skipAssignment) {
    return obj;
  }

  if (isChair(type) || isGuest(type)) {
    if (Math.random() < 0.6 || isGuest(type)) {
      obj.person = generatePerson();
    }
  }

  return obj;
}

function generatePerson(): Person {
  const name = getRandomPhobia();
  let fear: Phobia | undefined;
  let smallFear: Phobia | undefined;

  const fearTypeRandomValue = Math.random();

  if (fearTypeRandomValue > 0.4) {
    fear = getRandomPhobiaExcluding([name]);
  }

  if (fearTypeRandomValue < 0.6) {
    smallFear = getRandomPhobiaExcluding([name, fear]);
  }

  return {
    name,
    fear,
    smallFear,
    hasPanic: false,
    afraidOf: [],
    makesAfraid: [],
  };
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
  const fromPerson = fromCell.person;
  fromCell.content = isGuest(fromCell) ? CellType.EMPTY : fromCell.type;
  fromCell.person = undefined;
  toCell.person = fromPerson;
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
        (otherGuest) => otherGuest.person.name === guest.person.fear,
      );
      const alsoAfraidOf = getScaryNeighbors(gameFieldData, guest);
      afraidOf.push(...alsoAfraidOf);

      guest.person.hasPanic = isPanic || afraidOf.length > 0;
      guest.person.afraidOf = afraidOf;
    });
  }

  const otherGuestsInRoom = getAllGuests(gameFieldData).filter(
    (guest) => guest.tableIndex === undefined,
  );
  otherGuestsInRoom.forEach((guest) => {
    const afraidOf = getScaryNeighbors(gameFieldData, guest);
    guest.person.hasPanic = afraidOf.length > 0;
    guest.person.afraidOf = afraidOf;
  });

  const allGuests = getAllGuests(gameFieldData);
  const afraidGuests = allGuests.filter((guest) => guest.person.hasPanic);
  allGuests.forEach((guest) => {
    guest.person.makesAfraid = afraidGuests.filter((otherGuest) =>
      otherGuest.person.afraidOf.find((afraidOf) =>
        isSameCell(afraidOf, guest),
      ),
    );
  });

  return panickedTableCells;
}

function getScaryNeighbors(gameFieldData: GameFieldData, cell: OccupiedCell) {
  const neighbors = getNeighbors(gameFieldData, cell.row, cell.column);
  const neighborsWithPerson = neighbors.filter(hasPerson);
  return neighborsWithPerson.filter(
    (neighbor) => neighbor.person.name === cell.person.smallFear,
  );
}

function getGuestsOnTable(
  gameFieldData: GameFieldData,
  tableIndex: number,
): OccupiedCell[] {
  return gameFieldData
    .flat()
    .filter(
      (cell): cell is OccupiedCell =>
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
  return getAllGuests(gameFieldData).filter((guest) => !guest.person.hasPanic);
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
  const guestsWithBigFear = allGuests.filter((guest) => guest.person.fear);
  const guestsPotentiallyInvolvedInDeadlock: OccupiedCell[] = [];
  const scaryGuestsWithBigFear: OccupiedCell[] = [];
  const fearedAtLeastOnce: Phobia[] = [];

  guestsWithBigFear.forEach((guest) => {
    const afraidByMany =
      guestsWithBigFear.filter((g) => g.person.fear === guest.person.name)
        .length > 1;

    const afraidOf = guestsWithBigFear.filter(
      (g) => g.person.name === guest.person.fear,
    );

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
        pushPrimitiveIfNotInList(afraidOf[i].person.name, fearedAtLeastOnce);
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

function pushPrimitiveIfNotInList<T>(value: T, list: T[]) {
  if (!list.includes(value)) {
    list.push(value);
  }
}

function resolveDeadlock(
  gameFieldData: GameFieldData,
  guestsInvolvedInDeadlock: OccupiedCell[],
  fearedAtLeastOnce: Phobia[],
) {
  for (let i = 0; i < guestsInvolvedInDeadlock.length; i++) {
    const copyOfGuest = guestsInvolvedInDeadlock[i];
    const guest = gameFieldData[copyOfGuest.row][copyOfGuest.column];

    guest.person.fear = getRandomPhobiaExcluding([
      guest.content,
      ...fearedAtLeastOnce,
    ]);
    if (guest.person.fear) {
      fearedAtLeastOnce.push(guest.person.fear);
    } else {
      guest.person.smallFear = getRandomPhobia();
    }

    console.log("updated guest to resolve deadlock", copyOfGuest, guest);
  }
}
