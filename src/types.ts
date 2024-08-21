import { Phobia } from "./phobia";

export enum CellType {
  GUEST = "👤",
  EMPTY = "",
  TABLE = "🟫",
  CHAIR = "🪑",
  DOOR = "🚪",
  WINDOW = "🪟",
}

export interface Cell {
  type: CellType;
  row: number;
  column: number;
  tableIndex?: number;
  content: CellType;
  person?: Person;
}

export interface OccupiedCell extends Cell {
  person: Person;
}

export interface Person {
  name: Phobia;
  fear: Phobia | undefined;
  smallFear: Phobia | undefined;
  hasPanic: boolean;
  afraidOf: OccupiedCell[];
  makesAfraid: OccupiedCell[];
}

export type GameFieldData = Cell[][];

// type helpers

const getType = (typeOrObject: string | Cell) => (typeof typeOrObject === "string" ? typeOrObject : typeOrObject.type);

export const isTable = (typeOrObject: string | Cell) => getType(typeOrObject) === CellType.TABLE;
export const isGuest = (typeOrObject: string | Cell) => getType(typeOrObject) === CellType.GUEST;
export const isDoor = (typeOrObject: string | Cell) => getType(typeOrObject) === CellType.DOOR;
export const isWindow = (typeOrObject: string | Cell) => getType(typeOrObject) === CellType.WINDOW;
export const isChair = (typeOrObject: string | Cell) => getType(typeOrObject) === CellType.CHAIR;

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
