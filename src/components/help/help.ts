import "./help.scss";

import { createElement } from "../../utils/html-utils";
import { getTranslation, isGermanLanguage, TranslationKey } from "../../translations";
import { Cell, CellType, hasPerson, isChair, isEmpty, isTable, OccupiedCell } from "../../types";
import { getPhobiaName, Phobia } from "../../phobia";
import { createDialog, Dialog } from "../dialog";
import { CellElementObject, createCellElement } from "../game-field/cell-component";
import { getChairsAtTable, getGuestsOnTable } from "../../logic/checks";
import { globals } from "../../globals";

let helpDialog: Dialog | undefined;

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

  const exampleHeading = createElement({
    tag: "h3",
    text: isEmptyState ? getTranslation(TranslationKey.WELCOME) : getTranslation(TranslationKey.ABOUT, name),
    cssClass: isEmptyState ? "welcome" : "",
  });

  miniHelpContent.append(exampleHeading);

  const helpText = createElement({});
  let helpCellElementObject: CellElementObject | undefined;

  if (cell && hasPerson(cell)) {
    miniHelpContent.append(getSatisfactionStats(cell));

    helpCellElementObject = createCellElement(cell);
    const { name, fear, smallFear } = cell.person;

    const isGerman = isGermanLanguage();
    const fearName = getPhobiaName(fear, isGerman);
    const smallFearName = getPhobiaName(smallFear, isGerman);

    const helpTexts = [
      fear ? getTranslation(TranslationKey.EXAMPLE_BIG_FEAR, fearName, fear) : "",
      smallFear ? getTranslation(TranslationKey.EXAMPLE_SMALL_FEAR, smallFearName, smallFear) : "",
    ];

    helpText.innerHTML = helpTexts
      .filter(Boolean)
      .map((text) => `<p>${text}</p>`)
      .join("");
  } else if (cell) {
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
  } else {
    const helpTexts = [getTranslation(TranslationKey.GOAL), getTranslation(TranslationKey.INFO_PLACEHOLDER)];

    helpText.innerHTML = helpTexts.map((text) => `<p>${text}</p>`).join("");
  }

  miniHelpContent.append(helpText);

  if (helpCellElementObject) {
    miniHelpContent.append(helpCellElementObject.elem);
  } else {
    const placeholder = createElement({
      cssClass: "cell",
      text: "?",
    });
    miniHelpContent.append(placeholder);
  }

  return miniHelpContent;
}

function getSatisfactionStats(cell: OccupiedCell): HTMLElement {
  const hasChair = isChair(cell.type);
  const noBigFear = cell.person.afraidOf.filter((otherCell) => cell.person.fear === otherCell.person.name).length === 0;
  const noSmallFear = cell.person.afraidOf.filter((otherCell) => cell.person.smallFear === otherCell.person.name).length === 0;

  const satisfactionStats = createElement({
    cssClass: "satisfaction-stats",
  });

  const statsGrid = createElement({
    cssClass: "stats-grid",
  });

  const stats: { phobia: Phobia | CellType.CHAIR; satisfied: boolean; noFear?: boolean; explainText: string }[] = [
    { phobia: cell.person.fear, satisfied: noBigFear, explainText: getTranslation(TranslationKey.INFO_BIG_FEAR) },
    { phobia: cell.person.smallFear, satisfied: noSmallFear, explainText: getTranslation(TranslationKey.INFO_SMALL_FEAR) },
    { phobia: CellType.CHAIR, satisfied: hasChair, noFear: true, explainText: getTranslation(TranslationKey.INFO_FOMO) },
  ];

  stats.forEach(({ phobia, satisfied, noFear, explainText }) => {
    const stat = createElement({
      cssClass: `stat ${satisfied ? "satisfied" : "unsatisfied"}`,
    });

    const elems = [
      phobia ? `<span>${satisfied ? "✔" : "X"}</span>` : "",
      phobia ? `<span class="${noFear ? "" : "fear"}">${phobia}</span>` : "",
      phobia ? `<span>${explainText}</span>` : "",
    ];

    stat.innerHTML = elems.join(" ");

    statsGrid.append(stat);
  });

  satisfactionStats.append(statsGrid);

  return satisfactionStats;
}
