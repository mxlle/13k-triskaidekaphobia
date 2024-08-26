import "./help.scss";

import { createElement } from "../../utils/html-utils";
import { getTranslation, isGermanLanguage, TranslationKey } from "../../translations/i18n";
import { Cell, CellType, hasPerson, isChair, isEmpty, isTable, OccupiedCell } from "../../types";
import { getPhobiaName, Phobia } from "../../phobia";
import { createDialog, Dialog } from "../dialog/dialog";
import { CellElementObject, createCellElement } from "../game-field/cell-component";
import { getChairsAtTable, getGuestsOnTable } from "../../logic/checks";
import { globals } from "../../globals";

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
  const name = (cell?.person?.name ?? cell?.type ?? "<?>") || "[ ]";
  const isEmptyState = !cell;

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

    const helpTexts = [getTranslation(TranslationKey.GOAL), getTranslation(TranslationKey.INFO_PLACEHOLDER)];

    helpText.innerHTML = helpTexts.map((text) => `<p>${text}</p>`).join("");

    miniHelpContent.append(exampleHeading, helpText);

    const placeholder = createElement({
      cssClass: "cell",
      text: "?",
    });

    miniHelpContent.append(placeholder);

    return miniHelpContent;
  }
  let helpCellElementObject: CellElementObject | undefined;
  let statsElem: HTMLElement | undefined;

  if (hasPerson(cell)) {
    statsElem = getSatisfactionStats(cell);

    helpCellElementObject = createCellElement(cell);
    const { fear, smallFear } = cell.person;

    const isGerman = isGermanLanguage();
    const fearName = getPhobiaName(fear, isGerman);
    const smallFearName = getPhobiaName(smallFear, isGerman);

    const helpTexts = [
      cell.person.triskaidekaphobia ? getTranslation(TranslationKey.EXAMPLE_TRISKAIDEKAPHOBIA) : "",
      fear ? getTranslation(TranslationKey.EXAMPLE_BIG_FEAR, fearName, fear) : "",
      smallFear ? getTranslation(TranslationKey.EXAMPLE_SMALL_FEAR, smallFearName, smallFear) : "",
    ];

    helpText.innerHTML = helpTexts
      .filter(Boolean)
      .map((text) => `<p>${text}</p>`)
      .join("");
  } else {
    helpCellElementObject = createCellElement(cell, true);

    if (isTable(cell)) {
      const tableIndex = cell.tableIndex ?? 0;
      const numChairs = getChairsAtTable(globals.gameFieldData, tableIndex).length;
      const occupancy = getGuestsOnTable(globals.gameFieldData, tableIndex).length;

      const helpTexts = [
        getTranslation(TranslationKey.INFO_TABLE, tableIndex + 1),
        getTranslation(TranslationKey.INFO_TABLE_OCCUPANCY, occupancy, numChairs),
      ];

      if (occupancy === 13) {
        helpTexts.push("😱😱😱");
        helpCellElementObject.elem.classList.add("t13a");
      }

      helpText.innerHTML = helpTexts.map((text) => `<p>${text}</p>`).join("");
    } else {
      helpText.innerHTML = getTranslation(
        isChair(cell.type) ? TranslationKey.INFO_CHAIR : isEmpty(cell) ? TranslationKey.INFO_EMPTY : TranslationKey.INFO_DECOR,
      );
    }
  }

  if (helpCellElementObject) {
    miniHelpContent.append(helpCellElementObject.elem);
  }

  if (statsElem) {
    miniHelpContent.append(statsElem);
  }

  miniHelpContent.append(helpText);

  return miniHelpContent;
}

function getSatisfactionStats(cell: OccupiedCell): HTMLElement {
  const isTriskaidekaphobia = cell.person.triskaidekaphobia;
  const hasChair = isChair(cell.type);
  const noBigFear = cell.person.afraidOf.filter((otherCell) => cell.person.fear === otherCell.person.name).length === 0;
  const noSmallFear = cell.person.afraidOf.filter((otherCell) => cell.person.smallFear === otherCell.person.name).length === 0;

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
    { phobia: cell.person.fear, satisfied: noBigFear, explainText: getTranslation(TranslationKey.INFO_BIG_FEAR, cell.person.fear) },
    {
      phobia: cell.person.smallFear,
      satisfied: noSmallFear,
      explainText: getTranslation(TranslationKey.INFO_SMALL_FEAR, cell.person.smallFear),
    },
    { phobia: CellType.CHAIR, satisfied: hasChair, explainText: getTranslation(TranslationKey.INFO_FOMO) },
  ];

  stats
    .filter(({ phobia }) => !!phobia)
    .forEach(({ satisfied, explainText }) => {
      const stat = createElement({
        cssClass: `stat ${satisfied ? "satisfied" : "unsatisfied"}`,
      });

      const elems = [satisfied ? "✔" : "X", explainText];

      stat.innerHTML = elems.map((content) => `<span>${content}</span>`).join("");

      statsGrid.append(stat);
    });

  satisfactionStats.append(statsGrid);

  return satisfactionStats;
}
