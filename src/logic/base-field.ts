import { getCellTypesWithoutPrefix } from "../types";

export const baseField = (() => {
  const { _, T, c } = getCellTypesWithoutPrefix();
  return [
    [_, _, _, _, _, _, _, _, _, _],
    [_, c, T, c, _, _, c, T, c, _],
    [_, c, T, c, _, _, c, T, c, _],
    [_, c, T, c, _, _, c, T, c, _],
    [_, c, T, c, _, _, c, T, c, _],
    [_, c, T, c, _, _, c, T, c, _],
    [_, c, T, c, _, _, c, T, c, _],
    [_, c, T, c, _, _, c, T, c, _],
    [_, c, T, c, _, _, c, T, c, _],
    [_, _, _, _, _, _, _, _, _, _],
  ];
})();
