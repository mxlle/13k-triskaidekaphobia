import { isSameCell, PlacedPerson, pushCellIfNotInList } from "../types";
import { getNeighbors } from "./checks";

export function getChains(placedPersons: PlacedPerson[]): PlacedPerson[][] {
  const personsWithBigFear = placedPersons.filter((p) => p.fear !== undefined);
  const personsThatTriggerBigFear = placedPersons.filter((p) => personsWithBigFear.some((t) => t.fear === p.name));
  const personsWithRelevantBigFear = personsWithBigFear.filter((p) => personsThatTriggerBigFear.some((t) => t.name === p.fear));
  let involvedPersons = personsWithRelevantBigFear.concat(personsThatTriggerBigFear);

  const chains: PlacedPerson[][] = [];
  while (involvedPersons.length > 0) {
    const chain: PlacedPerson[] = [];
    const relatedPersons = [involvedPersons.pop()];
    while (relatedPersons.length > 0) {
      const currentPerson = relatedPersons.pop();
      pushCellIfNotInList(currentPerson, chain);
      relatedPersons.push(...involvedPersons.filter((p) => p.name === currentPerson.fear || p.fear === currentPerson.name));
      involvedPersons = involvedPersons.filter((p) => !relatedPersons.some((t) => isSameCell(t, p)));
    }
    chains.push(chain);
  }

  return chains;
}

export function simplifiedCalculateParViaChains(placedPersons: PlacedPerson[]): number {
  const chains = getChains(placedPersons);
  let par = placedPersons.length === 32 ? 2 : 0;

  for (let chain of chains) {
    const tables = splitChainIntoTables(chain);
    console.debug("Tables", tables);
    const variant1MismatchCount = getMismatchCount(tables, 0, 1);
    const variant2MismatchCount = getMismatchCount(tables, 1, 0);

    par += Math.min(variant1MismatchCount, variant2MismatchCount);
  }

  console.debug("Par from chains", par);

  return par + getPersonsWithSmallFearTriggered(placedPersons).length;
}

function getPersonsWithSmallFearTriggered(placedPersons: PlacedPerson[]): PlacedPerson[] {
  return placedPersons.filter((p) => {
    if (!p.smallFear) {
      return false;
    }

    const neighbors = getNeighbors(placedPersons, p);
    return neighbors.some((n) => n.name === p.smallFear);
  });
}

function getMismatchCount(tables: TableSplit, index0: 0 | 1, index1: 0 | 1): number {
  const mismatchCount0 = tables[0].filter((p) => p.tableIndex !== index0).length;
  const mismatchCount1 = tables[1].filter((p) => p.tableIndex !== index1).length;

  return mismatchCount0 + mismatchCount1;
}

type TableSplit = [PlacedPerson[], PlacedPerson[]];

function splitChainIntoTables(chain: PlacedPerson[]): TableSplit {
  const tables: TableSplit = [[], []];
  let remainingPersons = [...chain];

  while (remainingPersons.length > 0) {
    const person = remainingPersons.pop();
    const oppositePersons = remainingPersons.filter((p) => p.name === person.fear || p.fear === person.name);
    const canAddOppositesTo0 = oppositePersons.every((p) => canAddToTable(tables[0], p));
    const canAddPersonTo1 = canAddToTable(tables[1], person);
    if (canAddOppositesTo0 && canAddPersonTo1) {
      tables[0].push(...oppositePersons);
      tables[1].push(person);
    } else {
      tables[1].push(...oppositePersons);
      tables[0].push(person);
    }
    remainingPersons = remainingPersons.filter((p) => !oppositePersons.some((t) => isSameCell(t, p)));
  }

  return tables;
}

function canAddToTable(table: PlacedPerson[], person: PlacedPerson): boolean {
  return table.every((t) => t.name !== person.fear && t.fear !== person.name);
}
