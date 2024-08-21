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
