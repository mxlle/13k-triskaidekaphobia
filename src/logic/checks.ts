import { Cell, GameFieldData, hasPerson, isChair, isSameCell, isTable, OccupiedCell } from "../types";

export function checkTableStates(gameFieldData: GameFieldData) {
  const panickedTableCells: Cell[] = [];

  for (let tableIndex = 0; tableIndex < 2; tableIndex++) {
    const guests = getGuestsOnTable(gameFieldData, tableIndex);
    const isPanic = guests.length === 13;

    if (isPanic) {
      panickedTableCells.push(...getTableCells(gameFieldData, tableIndex));
    }

    guests.forEach((guest) => {
      const afraidOf = guests.filter((otherGuest) => otherGuest.person.name === guest.person.fear);
      const alsoAfraidOf = getScaryNeighbors(gameFieldData, guest);
      afraidOf.push(...alsoAfraidOf);

      guest.person.hasPanic = isPanic || afraidOf.length > 0;
      guest.person.triskaidekaphobia = isPanic;
      guest.person.afraidOf = afraidOf;
    });
  }

  const otherGuestsInRoom = getAllGuests(gameFieldData).filter((guest) => guest.tableIndex === undefined);
  otherGuestsInRoom.forEach((guest) => {
    const afraidOf = getScaryNeighbors(gameFieldData, guest);
    guest.person.hasPanic = afraidOf.length > 0;
    guest.person.afraidOf = afraidOf;
  });

  const allGuests = getAllGuests(gameFieldData);
  const afraidGuests = allGuests.filter((guest) => guest.person.hasPanic);
  allGuests.forEach((guest) => {
    guest.person.makesAfraid = afraidGuests.filter((otherGuest) =>
      otherGuest.person.afraidOf.find((afraidOf) => isSameCell(afraidOf, guest)),
    );
  });

  return panickedTableCells;
}

export function getScaryNeighbors(gameFieldData: GameFieldData, cell: OccupiedCell) {
  const neighbors = getNeighbors(gameFieldData, cell.row, cell.column);
  const neighborsWithPerson = neighbors.filter(hasPerson);
  return neighborsWithPerson.filter((neighbor) => neighbor.person.name === cell.person.smallFear);
}

// get all 8 neighbors of a cell, plus the three cells on the other side of the table
export function getNeighbors(gameFieldData: GameFieldData, row: number, column: number): Cell[] {
  const neighbors: Cell[] = [];

  for (let rowIndex = row - 1; rowIndex <= row + 1; rowIndex++) {
    for (let columnIndex = column - 1; columnIndex <= column + 1; columnIndex++) {
      if (rowIndex === row && columnIndex === column) {
        continue;
      }

      const cell = gameFieldData[rowIndex]?.[columnIndex];
      if (cell && hasPerson(cell)) {
        neighbors.push(cell);
      }
    }
  }

  // add the cell on the other side of the table
  const tableIndex = gameFieldData[row][column].tableIndex;
  const additionalNeighbors = getGuestsOnTable(gameFieldData, tableIndex).filter(
    (cell) => cell.column !== column && cell.row === row && neighbors.indexOf(cell) === -1,
  );

  neighbors.push(...additionalNeighbors);

  return neighbors;
}

export function getNearestTableCell(gameFieldData: GameFieldData, cell: Cell) {
  const tableIndex = cell.tableIndex;
  const tableCells = getTableCells(gameFieldData, tableIndex);
  return tableCells.find((tableCell) => tableCell.row === cell.row);
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
  const unseatedGuestList = totalGuestList.filter((g) => g.tableIndex === undefined);
  const happyGuests = happyGuestList.length - unseatedGuestList.length;
  const totalGuests = totalGuestList.length;
  const hasWon = happyGuests === totalGuests;

  return {
    happyGuests,
    totalGuests,
    hasWon,
  };
}

export function getTableCells(gameFieldData: GameFieldData, tableIndex: number) {
  return gameFieldData.flat().filter((cell) => isTable(cell) && cell.tableIndex === tableIndex);
}

export function getGuestsOnTable(gameFieldData: GameFieldData, tableIndex: number): OccupiedCell[] {
  return gameFieldData.flat().filter((cell): cell is OccupiedCell => cell.tableIndex === tableIndex && hasPerson(cell));
}

export function getChairsAtTable(gameFieldData: GameFieldData, tableIndex: number) {
  return gameFieldData.flat().filter((cell) => cell.tableIndex === tableIndex && isChair(cell));
}
