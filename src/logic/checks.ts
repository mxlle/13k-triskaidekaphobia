import { Cell, CellPositionWithTableIndex, GameFieldData, isAtTable, isChair, isSameCell, isTable, PlacedPerson } from "../types";

export function checkTableStates(gameFieldData: GameFieldData, placedPersons: PlacedPerson[]) {
  const panickedTableCells: Cell[] = [];

  for (let tableIndex = 0; tableIndex < 2; tableIndex++) {
    const guests = getGuestsOnTable(placedPersons, tableIndex);
    const isPanic = guests.length === 13;

    if (isPanic) {
      panickedTableCells.push(...getTableCells(gameFieldData, tableIndex));
    }

    guests.forEach((guest) => {
      const afraidOf = guests.filter((otherGuest) => otherGuest.name === guest.fear);
      const alsoAfraidOf = getScaryNeighbors(placedPersons, guest);
      afraidOf.push(...alsoAfraidOf);

      guest.hasPanic = afraidOf.length > 0;
      guest.triskaidekaphobia = isPanic;
      guest.afraidOf = afraidOf;
    });
  }

  const otherGuestsInRoom = placedPersons.filter((guest) => guest.tableIndex === undefined);
  otherGuestsInRoom.forEach((guest) => {
    const afraidOf = getScaryNeighbors(placedPersons, guest);
    guest.hasPanic = afraidOf.length > 0;
    guest.triskaidekaphobia = false;
    guest.afraidOf = afraidOf;
  });

  const afraidGuests = placedPersons.filter((guest) => guest.hasPanic);
  placedPersons.forEach((guest) => {
    guest.makesAfraid = afraidGuests.filter((otherGuest) => otherGuest.afraidOf.find((afraidOf) => isSameCell(afraidOf, guest)));
  });

  return panickedTableCells;
}

export function getScaryNeighbors(placedPersons: PlacedPerson[], person: PlacedPerson) {
  const neighbors = getNeighbors(placedPersons, person);
  return neighbors.filter((neighbor) => neighbor.name === person.smallFear);
}

// get all 8 neighbors of a cell, plus the three cells on the other side of the table
export function getNeighbors(placedPersons: PlacedPerson[], self: CellPositionWithTableIndex): PlacedPerson[] {
  const { row, column } = self;

  const neighbors: PlacedPerson[] = placedPersons.filter((person) => {
    const isSelf = person.row === row && person.column === column;
    const isOpposite = person.row === row && person.column !== column && person.tableIndex === self.tableIndex;

    return (!isSelf && Math.abs(person.row - row) <= 1 && Math.abs(person.column - column) <= 1) || isOpposite;
  });

  return neighbors;
}

export function getNearestTableCell(gameFieldData: GameFieldData, cell: CellPositionWithTableIndex) {
  const tableIndex = cell.tableIndex;
  const tableCells = getTableCells(gameFieldData, tableIndex);
  return tableCells.find((tableCell) => tableCell.row === cell.row);
}

export function getHappyGuests(persons: PlacedPerson[]) {
  return persons.filter((guest) => isAtTable(guest) && !guest.hasPanic && !guest.triskaidekaphobia);
}

export function getHappyStats(persons: PlacedPerson[]) {
  const happyGuestList = getHappyGuests(persons);
  const happyGuests = happyGuestList.length;
  const totalGuests = persons.length;
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

export function getGuestsOnTable(placedPersons: PlacedPerson[], tableIndex: number): PlacedPerson[] {
  return placedPersons.filter((person) => person.tableIndex === tableIndex);
}

export function getChairsAtTable(gameFieldData: GameFieldData, tableIndex: number) {
  return gameFieldData.flat().filter((cell) => cell.tableIndex === tableIndex && isChair(cell));
}
