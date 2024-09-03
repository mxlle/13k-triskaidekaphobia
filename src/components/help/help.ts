import "./help.scss";

import { createElement } from "../../utils/html-utils";
import { getTranslation, isGermanLanguage, TranslationKey } from "../../translations/i18n";
import { Cell, CellType, findPerson, isChair, isEmpty, isTable, PlacedPerson } from "../../types";
import { getPhobiaName, Phobia } from "../../phobia";
import { createDialog, Dialog } from "../dialog/dialog";
import { createCellElement, createPersonElement, updateCellOccupancy } from "../game-field/cell-component";
import { getChairsAtTable, getGuestsOnTable } from "../../logic/checks";
import { globals } from "../../globals";
import { getOnboardingData } from "../../logic/onboarding";

let helpDialog: Dialog | undefined;

interface HappyStat {
  phobia: Phobia | CellType.CHAIR | "😱";
  satisfied: boolean;
  explainText: string;
}

export function openHelp() {
  if (!helpDialog) {
    const helpContent = createElement({
      cssClass: "rules",
    });

    const helpText = createElement({});
    helpText.innerHTML = getTranslation(TranslationKey.RULES_CONTENT);

    helpContent.append(helpText);

    helpDialog = createDialog(helpContent, undefined, getTranslation(TranslationKey.RULES));
  }

  helpDialog.open();
}

export function getMiniHelpContent(cell?: Cell): HTMLElement {
  // const name = (cell?.person?.name ?? cell?.type ?? "<?>") || "[ ]";
  const isEmptyState = !cell;
  const person = cell ? findPerson(globals.placedPersons, cell) : undefined;

  const miniHelpContent = createElement({
    cssClass: "mini-help",
  });

  const helpText = createElement({});

  if (isEmptyState) {
    const exampleHeading = createElement({
      tag: "h3",
      text: getTranslation(TranslationKey.WELCOME),
      cssClass: "welcome",
    });

    const goalText = getOnboardingData() ? getTranslation(TranslationKey.GOAL) : getTranslation(TranslationKey.GOAL_2);

    const helpTexts = [goalText, getTranslation(TranslationKey.INFO_PLACEHOLDER)];

    helpText.innerHTML = helpTexts.map((text) => `<p>${text}</p>`).join("");

    miniHelpContent.append(exampleHeading, helpText);

    const placeholder = createElement({
      cssClass: "cell",
      text: "?",
    });

    miniHelpContent.append(placeholder);

    return miniHelpContent;
  }
  let helpCellElement: HTMLElement | undefined;
  let statsElem: HTMLElement | undefined;

  if (person) {
    statsElem = getSatisfactionStats(person);

    helpCellElement = createCellElement(cell);
    updateCellOccupancy(cell, helpCellElement, true);
    const personElement = createPersonElement(person);
    helpCellElement.append(personElement);
    helpCellElement.classList.toggle("has-person", true);
    const { fear, smallFear } = person;

    const isGerman = isGermanLanguage();
    const fearName = getPhobiaName(fear, isGerman);
    const smallFearName = getPhobiaName(smallFear, isGerman);

    const helpTexts = [
      person.triskaidekaphobia ? getTranslation(TranslationKey.EXAMPLE_TRISKAIDEKAPHOBIA) : "",
      fear ? getTranslation(TranslationKey.EXAMPLE_BIG_FEAR, fearName, fear) : "",
      smallFear ? getTranslation(TranslationKey.EXAMPLE_SMALL_FEAR, smallFearName, smallFear) : "",
    ];

    helpText.innerHTML = helpTexts
      .filter(Boolean)
      .map((text) => `<p>${text}</p>`)
      .join("");
  } else {
    helpCellElement = createCellElement(cell, true);

    if (isTable(cell)) {
      const tableIndex = cell.tableIndex ?? 0;
      const numChairs = getChairsAtTable(globals.gameFieldData, tableIndex).length;
      const occupancy = getGuestsOnTable(globals.placedPersons, tableIndex).length;

      const helpTexts = [
        getTranslation(TranslationKey.INFO_TABLE, tableIndex + 1),
        getTranslation(TranslationKey.INFO_TABLE_OCCUPANCY, occupancy, numChairs),
      ];

      if (occupancy === 13) {
        helpTexts.push("😱😱😱");
        helpCellElement.classList.add("t13a");
      }

      helpText.innerHTML = helpTexts.map((text) => `<p>${text}</p>`).join("");
    } else {
      helpText.innerHTML = getTranslation(
        isChair(cell.type) ? TranslationKey.INFO_CHAIR : isEmpty(cell) ? TranslationKey.INFO_EMPTY : TranslationKey.INFO_DECOR,
      );
    }
  }

  if (helpCellElement) {
    miniHelpContent.append(helpCellElement);
  }

  if (statsElem) {
    miniHelpContent.append(statsElem);
  }

  miniHelpContent.append(helpText);

  return miniHelpContent;
}

function getSatisfactionStats(person: PlacedPerson): HTMLElement {
  const isTriskaidekaphobia = person.triskaidekaphobia;
  const hasTable = person.tableIndex !== undefined;
  const noBigFear = !hasTable ? undefined : person.afraidOf.filter((otherCell) => person.fear === otherCell.name).length === 0;
  const noSmallFear = !hasTable ? undefined : person.afraidOf.filter((otherCell) => person.smallFear === otherCell.name).length === 0;

  const satisfactionStats = createElement({
    cssClass: "satisfaction-stats",
  });

  const statsGrid = createElement({
    cssClass: "stats-grid",
  });

  const stats: HappyStat[] = [
    {
      phobia: isTriskaidekaphobia ? "😱" : undefined,
      satisfied: !isTriskaidekaphobia,
      explainText: getTranslation(TranslationKey.INFO_TRISKAIDEKAPHOBIA),
    },
    { phobia: person.fear, satisfied: noBigFear, explainText: getTranslation(TranslationKey.INFO_BIG_FEAR, person.fear) },
    {
      phobia: person.smallFear,
      satisfied: noSmallFear,
      explainText: getTranslation(TranslationKey.INFO_SMALL_FEAR, person.smallFear),
    },
    { phobia: CellType.CHAIR, satisfied: hasTable, explainText: getTranslation(TranslationKey.INFO_FOMO) },
  ];

  stats
    .filter(({ phobia }) => !!phobia)
    .forEach(({ satisfied, explainText }) => {
      const stat = createElement({
        cssClass: `stat${satisfied !== undefined ? (satisfied ? " satisfied" : " unsatisfied") : ""}`,
      });

      const elems = [satisfied !== undefined ? (satisfied ? "✔" : "X") : "?", explainText];

      stat.innerHTML = elems.map((content) => `<span>${content}</span>`).join("");

      statsGrid.append(stat);
    });

  satisfactionStats.append(statsGrid);

  return satisfactionStats;
}
