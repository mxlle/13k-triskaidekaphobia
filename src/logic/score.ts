import { PlacedPerson } from "../types";
import { globals } from "../globals";

export function calculateScore(persons: PlacedPerson[], moves: number): number {
  if (!persons.length || !globals.metaData) {
    return 0;
  }

  const { minMoves, maxMoves } = globals.metaData;
  const moveSpan = Math.max(maxMoves - minMoves, 1);
  const diffToMin = Math.max(0, moves - minMoves);
  const diffToMax = Math.max(0, moves - maxMoves);
  const linearRegular = Math.min(1, diffToMin / moveSpan);
  // also still get some points for too much moves
  const linearFail = Math.min(1, diffToMax / (3 * moveSpan));

  let movesScore = 1 - 0.8 * linearRegular - 0.2 * linearFail;
  movesScore = Math.min(movesScore, 1);
  movesScore = Math.max(movesScore, 0);

  return Math.round(movesScore * 9999);
}
