import { Cell, CellType, GameFieldData, getCellTypesWithoutPrefix, isChair, isGuest, isTable, Person } from "../types";
import { getRandomPhobia, getRandomPhobiaExcluding, Phobia } from "../phobia";
import { findGuestsInvolvedInDeadlock, resolveDeadlock } from "./deadlock";
import { getOnboardingData, OnboardingData } from "./onboarding";

const baseField = (() => {
  const { GUEST, EMPTY, TABLE, CHAIR, DOOR_, WINDO } = getCellTypesWithoutPrefix();
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

export function getGameFieldData(skipAssignment: boolean = false): GameFieldData {
  let field = baseField;
  let onboardingData: OnboardingData | undefined = getOnboardingData();
  let tableHeight = 7;

  if (onboardingData) {
    field = onboardingData.field;
    tableHeight = onboardingData.tableHeight;
  }

  document.body.style.setProperty("--s-cnt", field.length.toString());
  document.body.style.setProperty("--table-height", tableHeight.toString());

  const gameField: GameFieldData = [];
  for (let row = 0; row < field.length; row++) {
    const baseRow = field[row];
    const rowArray: Cell[] = [];
    for (let column = 0; column < baseRow.length; column++) {
      const baseCell = baseRow[column];

      rowArray.push(getGameFieldObject(baseCell, row, column, skipAssignment, onboardingData));
    }
    gameField.push(rowArray);
  }

  if (!skipAssignment) {
    const { guestsInvolvedInDeadlock, fearedAtLeastOnce } = findGuestsInvolvedInDeadlock(gameField);
    resolveDeadlock(gameField, guestsInvolvedInDeadlock, fearedAtLeastOnce);
  }

  return gameField;
}

function getGameFieldObject(
  type: CellType,
  row: number,
  column: number,
  skipAssignment: boolean,
  onboardingData: OnboardingData | undefined,
): Cell {
  const obj: Cell = {
    type,
    row,
    column,
    content: type === CellType.GUEST ? CellType.EMPTY : type,
  };

  if (isChair(type) || isTable(type)) {
    obj.tableIndex = column > 4 ? 1 : 0;

    if (onboardingData) {
      obj.tableIndex = onboardingData.getTableIndex(row, column);
    }
  }

  if (skipAssignment) {
    return obj;
  }

  if (onboardingData) {
    const character = onboardingData.characters.find((c) => c.row === row && c.column === column);
    if (character) {
      obj.person = {
        name: character.name,
        fear: character.fear,
        smallFear: character.smallFear,
        hasPanic: false,
        afraidOf: [],
        makesAfraid: [],
      };
    }
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
