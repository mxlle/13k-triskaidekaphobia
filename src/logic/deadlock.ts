import { GameFieldData, OccupiedCell, pushCellIfNotInList } from "../types";
import { Phobia } from "../phobia";
import { pushPrimitiveIfNotInList } from "../utils/array-utils";
import { getRandomPhobia, getRandomPhobiaExcluding } from "./initialize";
import { getAllGuests } from "./checks";

export function findGuestsInvolvedInDeadlock(gameFieldData: GameFieldData) {
  const allGuests = getAllGuests(gameFieldData).map((guest) => ({ ...guest }));
  const guestsWithBigFear = allGuests.filter((guest) => guest.person.fear);
  const guestsPotentiallyInvolvedInDeadlock: OccupiedCell[] = [];
  const scaryGuestsWithBigFear: OccupiedCell[] = [];
  const fearedAtLeastOnce: Phobia[] = [];

  guestsWithBigFear.forEach((guest) => {
    const afraidByMany = guestsWithBigFear.filter((g) => g.person.fear === guest.person.name).length > 1;

    const afraidOf = guestsWithBigFear.filter((g) => g.person.name === guest.person.fear);

    if (afraidByMany && afraidOf.length > 0) {
      pushCellIfNotInList(guest, guestsPotentiallyInvolvedInDeadlock);
      pushCellIfNotInList(guest, scaryGuestsWithBigFear);
    }

    if (afraidOf.length > 1) {
      pushCellIfNotInList(guest, guestsPotentiallyInvolvedInDeadlock);

      for (let i = 0; i < afraidOf.length; i++) {
        pushCellIfNotInList(afraidOf[i], scaryGuestsWithBigFear);
      }
    }

    if (afraidOf.length > 0) {
      for (let i = 0; i < afraidOf.length; i++) {
        pushPrimitiveIfNotInList(afraidOf[i].person.name, fearedAtLeastOnce);
      }
    }
  });

  console.log("guestsPotentiallyInvolvedInDeadlock", guestsPotentiallyInvolvedInDeadlock);
  console.log("scaryGuestsWithBigFear", scaryGuestsWithBigFear);

  const guestsInvolvedInDeadlock = guestsPotentiallyInvolvedInDeadlock.filter((guest) => {
    return scaryGuestsWithBigFear.includes(guest);
  });

  console.log("guestsInvolvedInDeadlock", guestsInvolvedInDeadlock);
  console.log("fearedAtLeastOnce", fearedAtLeastOnce);

  return { guestsInvolvedInDeadlock, fearedAtLeastOnce };
}

export function resolveDeadlock(gameFieldData: GameFieldData, guestsInvolvedInDeadlock: OccupiedCell[], fearedAtLeastOnce: Phobia[]) {
  for (let i = 0; i < guestsInvolvedInDeadlock.length; i++) {
    const copyOfGuest = guestsInvolvedInDeadlock[i];
    const guest = gameFieldData[copyOfGuest.row][copyOfGuest.column];

    guest.person.fear = getRandomPhobiaExcluding([guest.content, ...fearedAtLeastOnce]);
    if (guest.person.fear) {
      fearedAtLeastOnce.push(guest.person.fear);
    } else {
      guest.person.smallFear = getRandomPhobia();
    }

    console.log("updated guest to resolve deadlock", copyOfGuest, guest);
  }
}
