const LOCAL_STORAGE_PREFIX = "mxlle-13th";

export const enum LocalStorageKey {
  STAR_MAP = "starMap"
};

export function setLocalStorageItem(key: LocalStorageKey, value: string | false) {
  if (value === false) {
    removeLocalStorageItem(key);
    return;
  }

  localStorage.setItem(LOCAL_STORAGE_PREFIX + "." + key, value);
}

export function getLocalStorageItem(key: LocalStorageKey) {
  return localStorage.getItem(LOCAL_STORAGE_PREFIX + "." + key);
}

export function removeLocalStorageItem(key: LocalStorageKey) {
  localStorage.removeItem(LOCAL_STORAGE_PREFIX + "." + key);
}

export function getArrayFromStorage(key: LocalStorageKey) {
  const item = getLocalStorageItem(key);
  if (!item) {
    return [];
  }

  return item.split(",");
}
