import "./help.scss";

import { createElement } from "../../utils/html-utils";
import { getTranslation, isGermanLanguage, TranslationKey } from "../../translations";
import { Cell, hasPerson, isChair, isEmpty, isTable } from "../../types";
import { getPhobiaName } from "../../phobia";
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

  const helpText = createElement({});
  let helpCellElementObject: CellElementObject | undefined;

  if (cell && hasPerson(cell)) {
    helpCellElementObject = createCellElement(cell);
    const { name, fear, smallFear } = cell.person;

    const isGerman = isGermanLanguage();
    const fearName = getPhobiaName(fear, isGerman);
    const smallFearName = getPhobiaName(smallFear, isGerman);

    const helpTexts = [
      isChair(cell.type) ? "" : getTranslation(TranslationKey.EXAMPLE_EMOJI, name),
      fear ? getTranslation(TranslationKey.EXAMPLE_BIG_FEAR, name, fearName, fear) : "",
      smallFear ? getTranslation(TranslationKey.EXAMPLE_SMALL_FEAR, name, smallFearName, smallFear) : "",
      getTranslation(TranslationKey.TARGET_CLICK),
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

  miniHelpContent.append(exampleHeading, helpText);

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
