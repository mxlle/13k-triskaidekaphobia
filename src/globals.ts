import { GameFieldData } from "./types";

interface GameGlobals {
  gameFieldData: GameFieldData;
  language: string;
}

const defaultGlobals: GameGlobals = {
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
