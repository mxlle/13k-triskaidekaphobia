import { Cell, GameFieldData, hasPerson, isEmpty, isSameCell, PlacedPerson } from "../types";
import { checkTableStates, getEmptyChairs, hasPanic, isUnhappy } from "./checks";
import { shuffleArray } from "../utils/random-utils";

interface Constellation {
  persons: PlacedPerson[];
  par: number;
}

function isSameConstellation(constellation1: PlacedPerson[], constellation2: PlacedPerson[]): boolean {
  return constellation1.every((p, index) => isSameCell(p, constellation2[index]));
}

let previousConstellations: Constellation[] = [];

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
