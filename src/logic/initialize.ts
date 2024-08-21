import { Cell, CellType, GameFieldData, isChair, isGuest, isTable, Person } from "../types";
import { getRandomPhobia, getRandomPhobiaExcluding, Phobia } from "../phobia";
import { findGuestsInvolvedInDeadlock, resolveDeadlock } from "./deadlock";

export const baseField = (() => {
  const { GUEST, EMPTY, TABLE, CHAIR, DOOR: DOOR_, WINDOW: WINDO } = CellType;
  return [
    [DOOR_, GUEST, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, WINDO],
    [GUEST, EMPTY, EMPTY, CHAIR, EMPTY, EMPTY, EMPTY, CHAIR, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, CHAIR, TABLE, CHAIR, EMPTY, CHAIR, TABLE, CHAIR, EMPTY, EMPTY],
    [EMPTY, EMPTY, CHAIR, TABLE, CHAIR, EMPTY, CHAIR, TABLE, CHAIR, EMPTY, EMPTY],
    [EMPTY, EMPTY, CHAIR, TABLE, CHAIR, EMPTY, CHAIR, TABLE, CHAIR, EMPTY, EMPTY],
    [EMPTY, EMPTY, CHAIR, TABLE, CHAIR, EMPTY, CHAIR, TABLE, CHAIR, EMPTY, EMPTY],
    [EMPTY, EMPTY, CHAIR, TABLE, CHAIR, EMPTY, CHAIR, TABLE, CHAIR, EMPTY, EMPTY],
    [EMPTY, EMPTY, CHAIR, TABLE, CHAIR, EMPTY, CHAIR, TABLE, CHAIR, EMPTY, EMPTY],
    [EMPTY, EMPTY, CHAIR, TABLE, CHAIR, EMPTY, CHAIR, TABLE, CHAIR, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, CHAIR, EMPTY, EMPTY, EMPTY, CHAIR, EMPTY, EMPTY, EMPTY],
    [WINDO, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, WINDO],
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

  if (!skipAssignment) {
    const { guestsInvolvedInDeadlock, fearedAtLeastOnce } = findGuestsInvolvedInDeadlock(gameField);
    resolveDeadlock(gameField, guestsInvolvedInDeadlock, fearedAtLeastOnce);
  }

  return gameField;
}

function getGameFieldObject(type: CellType, row: number, column: number, skipAssignment: boolean): Cell {
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
    if (Math.random() < 0.6) {
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
