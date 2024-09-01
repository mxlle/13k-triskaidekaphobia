import { GameFieldData } from "../types";
import { getHappyStats } from "./checks";
import { globals } from "../globals";

export function calculateScore(gameFieldData: GameFieldData, moves: number): number {
  const { happyGuests, totalGuests } = getHappyStats(gameFieldData);

  if (!totalGuests || !globals.metaData) {
    return 0;
  }

  const _progressModifier = Math.pow(happyGuests / totalGuests, 1);
  const movesScore =
    1 - Math.min(1, Math.max(moves - globals.metaData.minMoves, 0) / (globals.metaData.maxMoves - globals.metaData.minMoves));

  return Math.round(movesScore * 9999);
}
