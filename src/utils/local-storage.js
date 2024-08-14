const LOCAL_STORAGE_PREFIX = "mxlle-13th";

export const LocalStorageKey = {
  STAR_MAP: "starMap",
};

export function setLocalStorageItem(key, value) {
  if (value === false) {
    removeLocalStorageItem(key);
    return;
  }

  localStorage.setItem(LOCAL_STORAGE_PREFIX + "." + key, value);
}

export function getLocalStorageItem(key) {
  return localStorage.getItem(LOCAL_STORAGE_PREFIX + "." + key);
}

export function removeLocalStorageItem(key) {
  localStorage.removeItem(LOCAL_STORAGE_PREFIX + "." + key);
}

export function getArrayFromStorage(key) {
  const item = getLocalStorageItem(key);
  if (!item) {
    return [];
  }

  return item.split(",");
}
