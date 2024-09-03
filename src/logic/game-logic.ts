import { Cell, PlacedPerson } from "../types";
import { PubSubEvent, pubSubService } from "../utils/pub-sub-service";

export function newGame() {
  pubSubService.publish(PubSubEvent.NEW_GAME);
}

export function movePerson(person: PlacedPerson, toCell: Cell) {
  person.column = toCell.column;
  person.row = toCell.row;
  person.tableIndex = toCell.tableIndex;
}
