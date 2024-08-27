import {
  Cell,
  CellType,
  GameFieldData,
  getCellTypesWithoutPrefix,
  getGameFieldCopy,
  isChair,
  isEmptyChair,
  isTable,
  Person,
  PersonWithPosition,
} from "../types";
import { getRandomPhobia, getRandomPhobiaExcluding, Phobia } from "../phobia";
import { getOnboardingData, OnboardingData } from "./onboarding";
import { globals } from "../globals";
import { getRandomIntFromInterval, shuffleArray } from "../utils/random-utils";
import { getGuestsOnTable, getNeighbors } from "./checks";

const baseField = (() => {
  const { _, T, c } = getCellTypesWithoutPrefix();
  return [
    [_, _, _, _, _, _, _, _, _, _],
    [_, c, T, c, _, _, c, T, c, _],
    [_, c, T, c, _, _, c, T, c, _],
    [_, c, T, c, _, _, c, T, c, _],
    [_, c, T, c, _, _, c, T, c, _],
    [_, c, T, c, _, _, c, T, c, _],
    [_, c, T, c, _, _, c, T, c, _],
    [_, c, T, c, _, _, c, T, c, _],
    [_, c, T, c, _, _, c, T, c, _],
    [_, _, _, _, _, _, _, _, _, _],
  ];
})();

export function getGameFieldData(skipAssignment: boolean = false): GameFieldData {
  let field = baseField;
  let onboardingData: OnboardingData | undefined = getOnboardingData();
  let tableHeight = 8;

  if (onboardingData) {
    field = onboardingData.field;
    tableHeight = onboardingData.tableHeight;
  }

  document.body.style.setProperty("--s-cnt", field.length.toString());
  document.body.style.setProperty("--table-height", tableHeight.toString());

  if (tableHeight % 2 === 0) {
    const topValue = (tableHeight / 2 - 1) * -100;
    document.body.style.setProperty("--table-top", topValue.toString() + "%");
  }

  const gameField: GameFieldData = [];
  for (let row = 0; row < field.length; row++) {
    const baseRow = field[row];
    const rowArray: Cell[] = [];
    for (let column = 0; column < baseRow.length; column++) {
      const baseCell = baseRow[column];

      rowArray.push(getGameFieldObject(baseCell, row, column, onboardingData));
    }
    gameField.push(rowArray);
  }

  if (!skipAssignment) {
    if (onboardingData) {
      applySeatedCharacters(gameField, onboardingData.characters);
    } else {
      const charactersForGame = generateCharactersForGame(getGameFieldCopy(gameField));
      randomlyApplyCharactersOnBoard(gameField, charactersForGame);
    }
  }

  return gameField;
}

function getGameFieldObject(type: CellType, row: number, column: number, onboardingData: OnboardingData | undefined): Cell {
  const obj: Cell = {
    type,
    row,
    column,
  };

  if (isChair(type) || isTable(type)) {
    obj.tableIndex = column > 4 ? 1 : 0;

    if (onboardingData) {
      obj.tableIndex = onboardingData.getTableIndex(row, column);
    }
  }

  return obj;
}

function generateCharactersForGame(baseGameField: GameFieldData): Person[] {
  const { minAmount, maxAmount, chanceForBigFear, chanceForSmallFear } = globals.settings;
  const amount = getRandomIntFromInterval(minAmount, maxAmount);
  const characters: Person[] = [];

  while (characters.length < amount) {
    const newPerson = generatePerson(chanceForBigFear, chanceForSmallFear);
    const chair = findValidChair(baseGameField, newPerson);

    if (chair) {
      characters.push(newPerson);
      chair.person = newPerson;
    }
  }

  return characters;
}

function findValidChair(gameFieldData: GameFieldData, person: Person): Cell | undefined {
  const emptyChairs = gameFieldData.flat().filter(isEmptyChair);

  for (let chair of emptyChairs) {
    if (!isTriggeringPhobia(gameFieldData, chair, person)) {
      return chair;
    }
  }
}

function isTriggeringPhobia(gameFieldData: GameFieldData, cell: Cell, person: Person): boolean {
  const tableGuests = getGuestsOnTable(gameFieldData, cell.tableIndex);

  for (let guest of tableGuests) {
    const isAfraidOf = person.fear && guest.person.name === person.fear;
    const makesAfraid = guest.person.fear && guest.person.fear === person.name;

    if (isAfraidOf || makesAfraid) {
      return true;
    }
  }

  const neighbors = getNeighbors(gameFieldData, cell.row, cell.column);

  for (let guest of neighbors) {
    const isAfraidOf = person.smallFear && guest.person.name === person.smallFear;
    const makesAfraid = guest.person.smallFear && guest.person.smallFear === person.name;

    if (isAfraidOf || makesAfraid) {
      return true;
    }
  }

  return false;
}

function generatePerson(chanceForBigFear: number, chanceForSmallFear: number): Person {
  const name = getRandomPhobia();
  let fear: Phobia | undefined;
  let smallFear: Phobia | undefined;

  const fearTypeRandomValue = Math.random();

  if (fearTypeRandomValue > 1 - chanceForBigFear) {
    fear = getRandomPhobiaExcluding([name]);
  }

  if (fearTypeRandomValue < chanceForSmallFear) {
    smallFear = getRandomPhobiaExcluding([name, fear]);
  }

  return {
    name,
    fear,
    smallFear,
    hasPanic: false,
    triskaidekaphobia: false,
    afraidOf: [],
    makesAfraid: [],
  };
}

function randomlyApplyCharactersOnBoard(gameFieldData: GameFieldData, characters: Person[]) {
  const allChairs = gameFieldData.flat().filter(isEmptyChair);
  const shuffledRequiredChairs = shuffleArray(allChairs).slice(0, characters.length);
  shuffledRequiredChairs.forEach((chair: Cell) => {
    chair.person = characters.pop();
  });
}

function applySeatedCharacters(gameFieldData: GameFieldData, characters: PersonWithPosition[]) {
  characters.forEach((character) => {
    gameFieldData[character.row][character.column].person = {
      ...character,
      triskaidekaphobia: false,
      hasPanic: false,
      afraidOf: [],
      makesAfraid: [],
    };
  });
}
