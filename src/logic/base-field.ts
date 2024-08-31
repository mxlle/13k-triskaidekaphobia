import { getCellTypesWithoutPrefix } from "../types";

export const baseField = (() => {
  const { _, T, c } = getCellTypesWithoutPrefix();
  return [
    [c, T, c, _, _, c, T, c],
    [c, T, c, _, _, c, T, c],
    [c, T, c, _, _, c, T, c],
    [c, T, c, _, _, c, T, c],
    [c, T, c, _, _, c, T, c],
    [c, T, c, _, _, c, T, c],
    [c, T, c, _, _, c, T, c],
    [c, T, c, _, _, c, T, c],
  ];
})();
