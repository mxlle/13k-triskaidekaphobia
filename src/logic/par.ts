import { Cell, GameFieldData, hasPerson, isEmpty, isSameCell, PlacedPerson } from "../types";
import { checkTableStates, getEmptyChairs, isUnhappy, isUnhappyIgnoreTriskaidekaphobia } from "./checks";

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
  const remainingUnhappyCells = placedPersons.filter(isUnhappy);
  const unhappyCount = remainingUnhappyCells.length;

  if (unhappyCount === 0) {
    return 0;
  }

  if (iteration > 8) {
    debugger;
    console.info("Par too complex, returning fallback value");

    return unhappyCount;
  }

  const cellsRelatedToUnhappyPersons = placedPersons.filter((p) => {
    const isUnhappyCell = isUnhappy(p);
    const isMakingMoreThanOnePersonUnhappy = remainingUnhappyCells.filter((t) => t.afraidOf.some((a) => isSameCell(a, p))).length > 1;

    return isUnhappyCell || isMakingMoreThanOnePersonUnhappy;
  });

  const emptyChairs = getEmptyChairs(gameFieldData, placedPersons);
  const emptyField = gameFieldData.flat().find((c) => isEmpty(c) && !hasPerson(placedPersons, c));

  const MAX = 1000;

  // intelligent solution to find the smallest number of required moves
  let par = MAX;

  for (let personToMove of cellsRelatedToUnhappyPersons) {
    const unhappyCellCounts = emptyChairs.map((chair) => {
      const subPlacedPersons = placedPersons.map((p) =>
        isSameCell(p, personToMove) ? { ...p, row: chair.row, column: chair.column, tableIndex: chair.tableIndex } : p,
      );
      checkTableStates(gameFieldData, subPlacedPersons);

      return subPlacedPersons.filter(isUnhappyIgnoreTriskaidekaphobia).length;
    });

    const smallestUnhappyCellCount = Math.min(...unhappyCellCounts);

    let validCellsWithSmallestUnhappyCellCount: Cell[];

    if (smallestUnhappyCellCount >= unhappyCount) {
      if (wasEmptyCell) {
        continue;
      }

      validCellsWithSmallestUnhappyCellCount = [emptyField];
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

      const subPar = calculatePar(gameFieldData, subPlacedPersons, iteration + 1, wasEmptyCell) + 1;
      previousConstellations.push({ persons: subPlacedPersons, par: subPar });

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
