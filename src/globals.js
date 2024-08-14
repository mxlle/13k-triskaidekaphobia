const defaultGlobals = {
  language: "en",
};

export const globals = {};
resetGlobals();

export function resetGlobals() {
  Object.assign(globals, defaultGlobals);
}

function getNumFromParam(param, fallback) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const valueParam = urlParams.get(param);
  let num = valueParam ? Number(valueParam) : fallback;
  num = isNaN(num) ? fallback : num;

  return num;
}
