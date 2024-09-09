import { Cell, GameFieldData, hasPerson, isEmpty, isSameCell, PlacedPerson, pushCellIfNotInList } from "../types";
import { checkTableStates, getEmptyChairs, getNeighbors, hasPanic, isUnhappy } from "./checks";
import { shuffleArray } from "../utils/random-utils";

interface Constellation {
  persons: PlacedPerson[];
  par: number;
}

function isSameConstellation(constellation1: PlacedPerson[], constellation2: PlacedPerson[]): boolean {
  return constellation1.every((p, index) => isSameCell(p, constellation2[index]));
}

let previousConstellations: Constellation[] = [];
let skippedPersons: PlacedPerson[] = [];

export function calculatePar(
  gameFieldData: GameFieldData,
  placedPersons: PlacedPerson[],
  iteration: number = 0,
  wasEmptyCell: boolean = false,
): number {
  if (iteration === 0) {
    previousConstellations = [];
  }

  checkTableStates(gameFieldData, placedPersons);

  const remainingPanickedCells = placedPersons.filter(hasPanic);
  const panickedCount = remainingPanickedCells.length;

  if (panickedCount === 0) {
    const remainingUnhappyCells = placedPersons.filter(isUnhappy);
    const unhappyCount = remainingUnhappyCells.length;

    if (unhappyCount === 0) {
      return 0;
    } else {
      const unseatedPersons = placedPersons.filter((p) => p.tableIndex === undefined);
      if (unseatedPersons.length > 0) {
        return calculateParForFomo(gameFieldData, placedPersons, iteration);
      }

      return calculateParForTriskaidekaphobia(gameFieldData, placedPersons, iteration);
    }
  }

  if (iteration > 8) {
    debugger;
    console.info("Par too complex, returning fallback value");

    return panickedCount;
  }

  return innerParCalc(gameFieldData, placedPersons, iteration, wasEmptyCell, remainingPanickedCells);
}

// can probably be replaced with getChainsAndSplitToTables
export function getChains(placedPersons: PlacedPerson[]): PlacedPerson[][] {
  const personsWithBigFear = placedPersons.filter((p) => p.fear !== undefined);
  const personsThatTriggerBigFear = placedPersons.filter((p) => personsWithBigFear.some((t) => t.fear === p.name));
  const personsWithRelevantBigFear = personsWithBigFear.filter((p) => personsThatTriggerBigFear.some((t) => t.name === p.fear));
  let involvedPersons = personsWithRelevantBigFear.concat(personsThatTriggerBigFear);

  const chains: PlacedPerson[][] = [];
  while (involvedPersons.length > 0) {
    const chain: PlacedPerson[] = [];
    const relatedPersons = [involvedPersons.pop()];
    while (relatedPersons.length > 0) {
      const currentPerson = relatedPersons.pop();
      pushCellIfNotInList(currentPerson, chain);
      relatedPersons.push(...involvedPersons.filter((p) => p.name === currentPerson.fear || p.fear === currentPerson.name));
      involvedPersons = involvedPersons.filter((p) => !relatedPersons.some((t) => isSameCell(t, p)));
    }
    chains.push(chain.sort(sortByName));
  }

  return chains.sort((a, b) => b.length - a.length);
}

export function calculateParViaChains(gameFieldData: GameFieldData, placedPersons: PlacedPerson[], iteration: number = 0): number {
  if (iteration === 0) {
    skippedPersons = [];
  }

  const chains = getChains(placedPersons);
  let par = 0;

  for (let chain of chains) {
    const tables = splitChainIntoTables(chain);
    console.debug("Tables", tables);
    const variant1MismatchCount = getMismatchCount(tables, 0, 1);
    const variant2MismatchCount = getMismatchCount(tables, 1, 0);
    console.debug("Mismatch counts", variant1MismatchCount, variant2MismatchCount);

    let subPar = 0;

    if (variant1MismatchCount < variant2MismatchCount) {
      subPar = resolveTableConstraints(gameFieldData, placedPersons, tables, 0, 1);
    } else {
      subPar = resolveTableConstraints(gameFieldData, placedPersons, tables, 1, 0);
    }

    par += subPar;
  }

  console.debug("Skipped persons", skippedPersons);

  for (let person of skippedPersons) {
    const validChair = findValidChair(gameFieldData, placedPersons, person, person.tableIndex === 0 ? 1 : 0);
    if (validChair) {
      assignChairToPerson(person, validChair);
      par += 1;
    } else {
      console.debug("Still no valid empty chair found for skipped person", person);
    }
  }

  console.debug("Par from chains", par);

  return par + simplifiedInnerParCalc(gameFieldData, placedPersons);
}

function simplifiedInnerParCalc(gameFieldData: GameFieldData, placedPersons: PlacedPerson[]): number {
  checkTableStates(gameFieldData, placedPersons);
  const remainingPanickedCells = placedPersons.filter(hasPanic);
  return remainingPanickedCells.length;
}

function resolveTableConstraints(
  gameFieldData: GameFieldData,
  placedPersons: PlacedPerson[],
  tables: TableSplit,
  index0: 0 | 1,
  index1: 0 | 1,
): number {
  let par = 0;
  const misplaced0 = tables[0].filter((p) => p.tableIndex !== index0);
  const misplaced1 = tables[1].filter((p) => p.tableIndex !== index1);
  while (misplaced0.length > 0 || misplaced1.length > 0) {
    const longerTable = misplaced0.length > misplaced1.length ? misplaced0 : misplaced1;
    const nextPerson = longerTable.pop();
    const oppositeTableIndex = nextPerson.tableIndex === 0 ? 1 : 0;
    const validChair = findValidChair(gameFieldData, placedPersons, nextPerson, oppositeTableIndex);
    if (validChair) {
      assignChairToPerson(nextPerson, validChair);
      par += 1;
    } else {
      const emptyField = getEmptyField(gameFieldData, placedPersons);
      if (emptyField) {
        assignChairToPerson(nextPerson, emptyField);
        par += 1;
      }
      skippedPersons.push(nextPerson);
      console.debug("No valid empty chairs found, skip for now");
    }
  }

  return par;
}

function getEmptyField(gameFieldData: GameFieldData, placedPersons: PlacedPerson[]): Cell {
  const emptyFields = gameFieldData.flat().filter((c) => isEmpty(c) && !hasPerson(placedPersons, c));
  return emptyFields[0];
}

function findValidChair(gameFieldData: GameFieldData, placedPersons: PlacedPerson[], person: PlacedPerson, index: 0 | 1): Cell {
  const emptyChairs = getEmptyChairs(gameFieldData, placedPersons).filter((c) => c.tableIndex === index);
  const validEmptyChairs = emptyChairs.filter((c) => {
    const neighbors = getNeighbors(placedPersons, c);

    return neighbors.every((n) => n.smallFear !== person.name && n.name !== person.smallFear);
  });

  return validEmptyChairs[0];
}

function assignChairToPerson(placedPerson: PlacedPerson, chair: Cell): void {
  placedPerson.row = chair.row;
  placedPerson.column = chair.column;
  placedPerson.tableIndex = chair.tableIndex;
}

function getMismatchCount(tables: TableSplit, index0: 0 | 1, index1: 0 | 1): number {
  const mismatchCount0 = tables[0].filter((p) => p.tableIndex !== index0).length;
  const mismatchCount1 = tables[1].filter((p) => p.tableIndex !== index1).length;

  return mismatchCount0 + mismatchCount1;
}

type TableSplit = [PlacedPerson[], PlacedPerson[]];

function splitChainIntoTables(chain: PlacedPerson[]): TableSplit {
  const tables: TableSplit = [[], []];
  let remainingPersons = [...chain];

  while (remainingPersons.length > 0) {
    const person = remainingPersons.pop();
    const oppositePersons = remainingPersons.filter((p) => p.name === person.fear || p.fear === person.name);
    const canAddOppositesTo0 = oppositePersons.every((p) => canAddToTable(tables[0], p));
    const canAddPersonTo1 = canAddToTable(tables[1], person);
    if (canAddOppositesTo0 && canAddPersonTo1) {
      tables[0].push(...oppositePersons);
      tables[1].push(person);
    } else {
      tables[1].push(...oppositePersons);
      tables[0].push(person);
    }
    remainingPersons = remainingPersons.filter((p) => !oppositePersons.some((t) => isSameCell(t, p)));
  }

  return tables;
}

function canAddToTable(table: PlacedPerson[], person: PlacedPerson): boolean {
  return table.every((t) => t.name !== person.fear && t.fear !== person.name);
}

function sortByName(a: PlacedPerson, b: PlacedPerson): number {
  return a.name.localeCompare(b.name);
}

function innerParCalc(
  gameFieldData: GameFieldData,
  placedPersons: PlacedPerson[],
  iteration: number,
  wasEmptyCell: boolean,
  remainingPanickedCells: PlacedPerson[],
): number {
  const cellsRelatedToUnhappyPersons = placedPersons.filter((p) => {
    const isPanickedCell = hasPanic(p);
    const numOfPeopleThatAreAfraidOfThem = remainingPanickedCells.filter((t) => t.afraidOf.some((a) => isSameCell(a, p))).length;
    const isMakingMoreThanOnePersonUnhappy = numOfPeopleThatAreAfraidOfThem > 1;
    const existsMoreThanOnceAndScaresSomeone =
      placedPersons.filter((t) => t.name === p.name).length > 1 && numOfPeopleThatAreAfraidOfThem > 0;

    if (existsMoreThanOnceAndScaresSomeone) {
      console.debug("existsMoreThanOnceAndScaresSomeone", p);
    }

    return isPanickedCell || isMakingMoreThanOnePersonUnhappy || existsMoreThanOnceAndScaresSomeone;
  });

  const emptyChairs = getEmptyChairs(gameFieldData, placedPersons);
  const emptyFields = gameFieldData.flat().filter((c) => isEmpty(c) && !hasPerson(placedPersons, c));

  // intelligent solution to find the smallest number of required moves
  let par = 1000;

  // todo - check if slice ok
  for (let personToMove of cellsRelatedToUnhappyPersons.slice(0, 3)) {
    const unhappyCellCounts = emptyChairs.map((chair) => {
      const subPlacedPersons = placedPersons.map((p) =>
        isSameCell(p, personToMove) ? { ...p, row: chair.row, column: chair.column, tableIndex: chair.tableIndex } : { ...p },
      );
      checkTableStates(gameFieldData, subPlacedPersons);

      return subPlacedPersons.filter(hasPanic).length;
    });

    const smallestUnhappyCellCount = Math.min(...unhappyCellCounts);

    let validCellsWithSmallestUnhappyCellCount: Cell[];

    if (smallestUnhappyCellCount >= remainingPanickedCells.length) {
      if (wasEmptyCell) {
        continue;
      }

      validCellsWithSmallestUnhappyCellCount = shuffleArray([...emptyFields]).slice(0, 2); // todo - check if ok
    } else {
      validCellsWithSmallestUnhappyCellCount = emptyChairs.filter((_, i) => unhappyCellCounts[i] === smallestUnhappyCellCount);
    }

    for (let cell of validCellsWithSmallestUnhappyCellCount) {
      const wasEmptyCell = isEmpty(cell);
      const subPlacedPersons = placedPersons.map((p) =>
        isSameCell(p, personToMove) ? { ...p, row: cell.row, column: cell.column, tableIndex: cell.tableIndex } : p,
      );

      const prevConst = previousConstellations.find((c) => isSameConstellation(c.persons, subPlacedPersons));

      if (prevConst) {
        return prevConst.par;
      }

      const newConstellation = { persons: subPlacedPersons, par: 2000 }; // todo - check if ok
      previousConstellations.push(newConstellation);

      const subPar = calculatePar(gameFieldData, subPlacedPersons, iteration + 1, wasEmptyCell) + 1;
      newConstellation.par = subPar;

      if (subPar < par) {
        par = subPar;
      }

      if (par === 1) {
        return 1; // todo - check if ok
      }
    }
  }

  console.log("PAR", par);

  return par;
}

function calculateParForFomo(_gameFieldData: GameFieldData, placedPersons: PlacedPerson[], _iteration: number): number {
  console.debug("Calculating par for fomo");
  const unseatedPersons = placedPersons.filter((p) => p.tableIndex === undefined);

  return unseatedPersons.length; // todo - implement
}

function calculateParForTriskaidekaphobia(_gameFieldData: GameFieldData, _placedPersons: PlacedPerson[], _iteration: number): number {
  console.debug("Calculating par for triskaidekaphobia");

  return 2; // todo - implement
}
