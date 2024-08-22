import { GameFieldData } from "./types";
import { getLocalStorageItem, LocalStorageKey } from "./utils/local-storage";

interface GameGlobals {
  previousOnboardingStep: number | undefined;
  onboardingStep: number;
  baseFieldData: GameFieldData;
  gameFieldData: GameFieldData;
  language: string;
}

const onboardingStepSetting = getLocalStorageItem(LocalStorageKey.ONBOARDING_STEP);

const defaultGlobals: GameGlobals = {
  previousOnboardingStep: undefined,
  onboardingStep: onboardingStepSetting ? Number(onboardingStepSetting) : 0,
  baseFieldData: [],
  gameFieldData: [],
  language: "en",
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
