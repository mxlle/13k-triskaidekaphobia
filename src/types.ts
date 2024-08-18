import { SetRequired, Tagged } from "type-fest";
import { Emoji } from "./utils/emojis/emoji-util";

export enum CellType {
  GUEST = "👤",
  EMPTY = "",
  TABLE = "🟫",
  CHAIR = "🪑",
  DOOR = "🚪",
  WINDOW = "🪟",
}

export type Phobia = Tagged<Emoji, "Phobia">;

export interface Cell {
  type: CellType;
  row: number;
  column: number;
  tableIndex?: number;
  content: CellType | Phobia;
  fear?: Phobia;
  smallFear?: Phobia;
  hasPanic?: boolean;
  afraidOf?: Guest[];
  makesAfraid?: Guest[];
  elem?: HTMLElement;
  textElem?: HTMLElement;
  fearElem?: HTMLElement;
  smallFearElem?: HTMLElement;
}

export interface Guest extends Cell {
  type: CellType.GUEST;
  content: Phobia;
}

export type GameFieldData = Cell[][];
