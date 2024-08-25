import { getRandomPhobia, getRandomPhobiaExcluding } from "../phobia";
import { CellType, getCellTypesWithoutPrefix, PersonWithPosition } from "../types";
import { globals } from "../globals";
import { LocalStorageKey, setLocalStorageItem } from "../utils/local-storage";

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
}
// a 5 by 5 grid
const onboardingField = (() => {
  const { GUEST, EMPTY, TABLE, CHAIR, DOOR_, WINDO } = getCellTypesWithoutPrefix();
  return [
    [DOOR_, GUEST, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, CHAIR, TABLE, CHAIR],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, CHAIR, TABLE, CHAIR],
    [WINDO, EMPTY, EMPTY, EMPTY, EMPTY],
  ];
})();

// a 7 by 7 grid
const mediumField = (() => {
  const { GUEST, EMPTY, TABLE, CHAIR, DOOR_, WINDO } = getCellTypesWithoutPrefix();
  return [
    [DOOR_, GUEST, EMPTY, EMPTY, EMPTY, EMPTY, WINDO],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [CHAIR, TABLE, CHAIR, EMPTY, CHAIR, TABLE, CHAIR],
    [CHAIR, TABLE, CHAIR, EMPTY, CHAIR, TABLE, CHAIR],
    [CHAIR, TABLE, CHAIR, EMPTY, CHAIR, TABLE, CHAIR],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [WINDO, GUEST, EMPTY, EMPTY, EMPTY, EMPTY, WINDO],
  ];
})();

export function getOnboardingData(): OnboardingData | undefined {
  const step = globals.onboardingStep;

  switch (step) {
    case OnboardingStep.INTRO:
      return getOnboardingDataForIntro();
    case OnboardingStep.BIG_FEAR:
      return getOnboardingDataForBigFear();
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
      fear: undefined,
      smallFear: ob2,
      row: 0,
      column: 1,
    },
    {
      name: ob2,
      fear: undefined,
      smallFear: ob3,
      row: 1,
      column: 4,
    },
    {
      name: ob3,
      fear: undefined,
      smallFear: ob2,
      row: 3,
      column: 2,
    },
  ];

  return {
    field: onboardingField,
    characters: onboardingCharacters,
    tableHeight: 1,
    isTableMiddle: (rowIndex) => rowIndex === 1 || rowIndex === 3,
    getTableIndex: (row, _column) => {
      return row < 2 ? 0 : 1;
    },
  };
}

function getOnboardingDataForBigFear(): OnboardingData {
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
      column: 1,
    },
    {
      name: ob2,
      fear: undefined,
      smallFear: ob1,
      row: 2,
      column: 4,
    },
    {
      name: ob4,
      fear: undefined,
      smallFear: ob2,
      row: 3,
      column: 2,
    },
    {
      name: ob3,
      fear: ob5,
      smallFear: ob1,
      row: 2,
      column: 0,
    },
    {
      name: ob5,
      fear: undefined,
      smallFear: ob4,
      row: 4,
      column: 6,
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
  };
}
