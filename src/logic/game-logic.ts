import { Cell } from "../types";
import { PubSubEvent, pubSubService } from "../utils/pub-sub-service";

export function newGame() {
  pubSubService.publish(PubSubEvent.NEW_GAME);
}

export function moveGuest(fromCell: Cell, toCell: Cell) {
  const fromPerson = fromCell.person;
  fromCell.person = undefined;
  toCell.person = fromPerson;
}
