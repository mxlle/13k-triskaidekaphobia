import { GameFieldData, GameMetaData, Settings } from "./types";
import { getLocalStorageItem, LocalStorageKey } from "./utils/local-storage";
import { Difficulty, difficultySettings } from "./logic/difficulty";

interface GameGlobals {
  previousOnboardingStep: number | undefined;
  onboardingStep: number;
  baseFieldData: GameFieldData;
  gameFieldData: GameFieldData;
  language: string;
  difficulty: Difficulty;
  settings: Settings;
  metaData?: GameMetaData;
}

const onboardingStepSetting = getLocalStorageItem(LocalStorageKey.ONBOARDING_STEP);
const difficultySetting = getLocalStorageItem(LocalStorageKey.DIFFICULTY);

const initialDifficulty: Difficulty = difficultySetting ? Number(difficultySetting) : Difficulty.EASY;
const initialSettings = difficultySettings[initialDifficulty];

const defaultGlobals: GameGlobals = {
  previousOnboardingStep: undefined,
  onboardingStep: onboardingStepSetting ? Number(onboardingStepSetting) : 0,
  baseFieldData: [],
  gameFieldData: [],
  language: "en",
  difficulty: initialDifficulty,
  settings: initialSettings,
};

export const globals: GameGlobals = { ...defaultGlobals };

export function resetGlobals() {
  Object.assign(globals, defaultGlobals);
}

function getNumFromParam(param: string, fallback: number) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const valueParam = urlParams.get(param);
  let num = valueParam ? Number(valueParam) : fallback;
  num = isNaN(num) ? fallback : num;

  return num;
}
