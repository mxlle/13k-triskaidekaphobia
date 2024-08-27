import { getRandomPhobia, getRandomPhobiaExcluding } from "../phobia";
import { CellType, getCellTypesWithoutPrefix, PersonWithPosition } from "../types";
import { globals } from "../globals";
import { LocalStorageKey, setLocalStorageItem } from "../utils/local-storage";
import { Direction } from "../components/onboarding/onboarding-components";

export const enum OnboardingStep {
  INTRO = 0,
  BIG_FEAR = 1,
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

  if (step > OnboardingStep.BIG_FEAR) {
    step = -1;
  }

  globals.onboardingStep = step;
  setLocalStorageItem(LocalStorageKey.ONBOARDING_STEP, step.toString());
}

function getOnboardingDataForIntro(): OnboardingData {
  const ob1 = getRandomPhobia();
  const ob2 = getRandomPhobiaExcluding([ob1]);
  const ob3 = getRandomPhobiaExcluding([ob1, ob2]);
  const onboardingCharacters: PersonWithPosition[] = [
    {
      name: ob1,
      fear: ob2,
      smallFear: undefined,
      row: 1,
      column: 0,
    },
    {
      name: ob2,
      fear: undefined,
      smallFear: undefined,
      row: 0,
      column: 3,
    },
    {
      name: ob3,
      fear: undefined,
      smallFear: undefined,
      row: 3,
      column: 3,
    },
  ];

  return {
    field: onboardingField,
    characters: onboardingCharacters,
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
  const ob1 = getRandomPhobia();
  const ob2 = getRandomPhobiaExcluding([ob1]);
  const ob3 = getRandomPhobiaExcluding([ob1, ob2]);
  const ob4 = getRandomPhobiaExcluding([ob1, ob2, ob3]);
  const ob5 = getRandomPhobiaExcluding([ob1, ob2, ob3, ob4]);
  const onboardingCharacters: PersonWithPosition[] = [
    {
      name: ob1,
      fear: ob2,
      smallFear: ob3,
      row: 0,
      column: 3,
    },
    {
      name: ob2,
      fear: undefined,
      smallFear: undefined,
      row: 2,
      column: 0,
    },
    {
      name: ob4,
      fear: undefined,
      smallFear: undefined,
      row: 4,
      column: 6,
    },
    {
      name: ob3,
      fear: ob2,
      smallFear: undefined,
      row: 2,
      column: 4,
    },
    {
      name: ob5,
      fear: undefined,
      smallFear: undefined,
      row: 3,
      column: 2,
    },
  ];

  return {
    field: mediumField,
    characters: onboardingCharacters,
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
