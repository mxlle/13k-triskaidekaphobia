import { Phobia } from "./phobia";

export const enum CellType {
  EMPTY = "",
  TABLE = "🟫",
  CHAIR = "🪑",
}

export interface Settings {
  minAmount: number;
  maxAmount: number;
  chanceForBigFear: number;
  chanceForSmallFear: number;
  minInitialPanic: number;
}

interface CellPosition {
  row: number;
  column: number;
}

export interface Cell extends CellPosition {
  type: CellType;
  tableIndex?: number;
  person?: Person;
}

export interface OccupiedCell extends Cell {
  person: Person;
}

interface BasePerson {
  name: Phobia;
  fear: Phobia | undefined;
  smallFear: Phobia | undefined;
}

export interface Person extends BasePerson {
  hasPanic: boolean;
  triskaidekaphobia: boolean;
  afraidOf: OccupiedCell[];
  makesAfraid: OccupiedCell[];
}

export interface PersonWithPosition extends BasePerson, CellPosition {}

export type GameFieldData = Cell[][];

// type helpers

const getType = (typeOrObject: string | Cell) => (typeof typeOrObject === "string" ? typeOrObject : typeOrObject.type);

export const isTable = (typeOrObject: string | Cell) => getType(typeOrObject) === CellType.TABLE;
export const isChair = (typeOrObject: string | Cell) => getType(typeOrObject) === CellType.CHAIR;
export const isEmpty = (typeOrObject: string | Cell) => getType(typeOrObject) === CellType.EMPTY;

export function isEmptyChair(cell: Cell): boolean {
  return isChair(cell) && !hasPerson(cell);
}

export function hasPerson(cell: Cell): cell is OccupiedCell {
  return !!cell.person;
}

export function isSameCell(cell1: Cell, cell2: Cell) {
  return cell1.row === cell2.row && cell1.column === cell2.column;
}

export function pushCellIfNotInList(cell: Cell, list: Cell[]) {
  if (!list.find((c) => isSameCell(c, cell))) {
    list.push(cell);
  }
}

export function getCellTypesWithoutPrefix() {
  return {
    _: CellType.EMPTY,
    T: CellType.TABLE,
    c: CellType.CHAIR,
  };
}

export function getGameFieldCopy(gameFieldData: GameFieldData): GameFieldData {
  return JSON.parse(JSON.stringify(gameFieldData));
}
