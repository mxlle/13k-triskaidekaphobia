import { PlacedPerson } from "../types";
import { globals } from "../globals";

export function calculateScore(persons: PlacedPerson[], moves: number): number {
  if (!persons.length || !globals.metaData) {
    return 0;
  }

  const { minMoves, maxMoves } = globals.metaData;
  const moveSpan = Math.max(maxMoves - minMoves, 1);
  const diffToMin = moves - minMoves;

  let movesScore = 1 - diffToMin / moveSpan;
  movesScore = Math.min(movesScore, 1);
  movesScore = Math.max(movesScore, 0);

  return Math.round(movesScore * 9999);
}
