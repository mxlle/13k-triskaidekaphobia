import { ONBOARDING_PHOBIAS_EMOJIS, OnboardingEmojiIndex } from "../phobia";
import { CellType, getCellTypesWithoutPrefix, PersonWithPosition } from "../types";
import { globals } from "../globals";
import { LocalStorageKey, setLocalStorageItem } from "../utils/local-storage";
import { Direction } from "../components/onboarding/onboarding-components";
import { baseField } from "./base-field";
import type { IntRange } from "type-fest";
import { getRandomIntFromInterval } from "../utils/random-utils";

export const enum OnboardingStep {
  INTRO = 0,
  BIG_FEAR = 1,
  TRISKAIDEKAPHOBIA = 2,
}

export function isOnboarding() {
  return globals.onboardingStep !== -1;
}

export function wasOnboarding() {
  return isOnboarding() || globals.previousOnboardingStep !== undefined;
}

export interface OnboardingData {
  field: CellType[][];
  characters: PersonWithPosition[];
  tableHeight: number;
  isTableMiddle: (rowIndex: number) => boolean;
  getTableIndex: (row: number, column: number) => number;
  arrow?: {
    row: number;
    column: number;
    direction: Direction;
  };
}

type BaseFieldIndex = IntRange<0, 9>;

type ShortCharacterDefinition = [
  nameIndex: OnboardingEmojiIndex,
  fearIndex: OnboardingEmojiIndex | -1,
  smallFearIndex: OnboardingEmojiIndex | -1,
  rowIndex: BaseFieldIndex,
  columnIndex: BaseFieldIndex,
];

// a 4 by 4 grid
const onboardingField = (() => {
  const { _, T, c } = getCellTypesWithoutPrefix();
  return [
    [_, c, T, c],
    [_, _, _, _],
    [_, _, _, _],
    [_, c, T, c],
  ];
})();

// a 7 by 7 grid
const mediumField = (() => {
  const { _, T, c } = getCellTypesWithoutPrefix();
  return [
    [_, _, _, _, _, _, _],
    [_, _, _, _, _, _, _],
    [c, T, c, _, c, T, c],
    [c, T, c, _, c, T, c],
    [c, T, c, _, c, T, c],
    [_, _, _, _, _, _, _],
    [_, _, _, _, _, _, _],
  ];
})();

export function getOnboardingData(): OnboardingData | undefined {
  const step = globals.onboardingStep;

  switch (step) {
    case OnboardingStep.INTRO:
      return getOnboardingDataForIntro();
    case OnboardingStep.BIG_FEAR:
      return getOnboardingDataForBothPhobias();
    case OnboardingStep.TRISKAIDEKAPHOBIA:
      return getOnboardingDataForTriskaidekaphobia();
    default:
      return undefined;
  }
}

export function increaseOnboardingStepIfApplicable() {
  globals.previousOnboardingStep = globals.onboardingStep;

  if (!isOnboarding()) {
    return;
  }

  let step = globals.onboardingStep + 1;

  if (step > OnboardingStep.TRISKAIDEKAPHOBIA) {
    step = -1;
  }

  globals.onboardingStep = step;
  setLocalStorageItem(LocalStorageKey.ONBOARDING_STEP, step.toString());
}

const onboardingPhobias = [...ONBOARDING_PHOBIAS_EMOJIS];

function getOnboardingDataForIntro(): OnboardingData {
  const short: ShortCharacterDefinition[] = [
    [0, 1, -1, 1, 0],
    [1, -1, -1, 0, 3],
    [2, -1, -1, 3, 3],
  ];

  return {
    field: onboardingField,
    characters: getPersonsWithPositionFromShortDescription(short),
    tableHeight: 1,
    isTableMiddle: (rowIndex) => rowIndex === 0 || rowIndex === 3,
    getTableIndex: (row, _column) => {
      return row < 2 ? 0 : 1;
    },
    arrow: {
      row: 1,
      column: 0,
      direction: Direction.UP,
    },
  };
}

function getOnboardingDataForBothPhobias(): OnboardingData {
  const short: ShortCharacterDefinition[] = [
    [0, 1, 2, 0, 3],
    [1, -1, -1, 2, 0],
    [2, 1, -1, 2, 4],
    [3, -1, -1, 4, 6],
    [4, -1, -1, 3, 2],
  ];

  return {
    field: mediumField,
    characters: getPersonsWithPositionFromShortDescription(short),
    tableHeight: 3,
    isTableMiddle: (rowIndex) => rowIndex === 3,
    getTableIndex: (_row, column) => {
      return column < 3 ? 0 : 1;
    },
    arrow: {
      row: 0,
      column: 3,
      direction: Direction.LEFT,
    },
  };
}

/**
 * 24 characters, 12 at each table
 * 8 with big fear, 10 with small fear, 6 with both
 * 1st not at a table, all tables without panic
 */
function getOnboardingDataForTriskaidekaphobia(): OnboardingData {
  // there are 9 different emojis in the onboarding, so the nameIndex is 0-8, same for the fears, we then repeat some
  const onboardingCharacters: ShortCharacterDefinition[] = [
    [0, 2, 4, 0, 4],
    [1, 4, -1, 2, 1],
    [1, -1, -1, 3, 1],
    [2, 5, -1, 4, 1],
    [2, -1, -1, 5, 1],
    [3, -1, 6, 6, 1],
    [3, -1, -1, 7, 1],
    [1, -1, 6, 2, 3],
    [1, -1, -1, 3, 3],
    [2, -1, 3, 4, 3],
    [2, -1, -1, 5, 3],
    [3, 4, -1, 6, 3],
    [3, -1, -1, 7, 3],
    [4, -1, 0, 2, 6],
    [4, -1, 6, 3, 6],
    [5, 1, -1, 4, 6],
    [5, -1, -1, 5, 6],
    [6, 2, -1, 6, 6],
    [6, -1, -1, 7, 6],
    [4, -1, 3, 2, 8],
    [4, -1, -1, 3, 8],
    [5, 2, -1, 4, 8],
    [5, -1, -1, 5, 8],
    [6, -1, -1, 6, 8],
    [6, -1, 0, 7, 8],
  ];

  return {
    field: baseField,
    characters: getPersonsWithPositionFromShortDescription(onboardingCharacters),
    tableHeight: 8,
    isTableMiddle: (rowIndex: number) => rowIndex === Math.ceil(baseField.length / 2) - 1,
    getTableIndex: (_row, column) => (column > 4 ? 1 : 0),
    arrow: {
      row: 0,
      column: 4,
      direction: Direction.LEFT,
    },
  };
}

function getPersonsWithPositionFromShortDescription(short: ShortCharacterDefinition[]): PersonWithPosition[] {
  const cesar = getRandomIntFromInterval(0, ONBOARDING_PHOBIAS_EMOJIS.length - 1);
  const getOEmoji = (index) => {
    const newIndex = (index = cesar + index) % ONBOARDING_PHOBIAS_EMOJIS.length;
    return ONBOARDING_PHOBIAS_EMOJIS[newIndex];
  };

  return short.map(([nameIndex, fearIndex, smallFearIndex, rowIndex, columnIndex]) => {
    const name = getOEmoji(nameIndex);
    const fear = fearIndex !== -1 ? getOEmoji(fearIndex) : undefined;
    const smallFear = smallFearIndex !== -1 ? getOEmoji(smallFearIndex) : undefined;

    return {
      name,
      fear,
      smallFear,
      row: rowIndex,
      column: columnIndex,
    };
  });
}
