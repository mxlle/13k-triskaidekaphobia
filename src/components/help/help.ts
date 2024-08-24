import "./help.scss";

import { createElement } from "../../utils/html-utils";
import { getTranslation, isGermanLanguage, TranslationKey } from "../../translations";
import { Cell, isChair, isEmpty, isTable, OccupiedCell } from "../../types";
import { getPhobiaName } from "../../phobia";
import { createDialog, Dialog } from "../dialog";
import { CellElementObject, createCellElement } from "../game-field/cell-component";

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

export function getMiniHelpContent(occupiedCell?: OccupiedCell, cell?: Cell): HTMLElement {
  const name = (occupiedCell?.person.name ?? cell?.type ?? "<?>") || "[ ]";
  const isEmptyState = !occupiedCell && !cell;

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

  if (occupiedCell) {
    helpCellElementObject = createCellElement(occupiedCell);
    const { name, fear, smallFear } = occupiedCell.person;

    const isGerman = isGermanLanguage();
    const fearName = getPhobiaName(fear, isGerman);
    const smallFearName = getPhobiaName(smallFear, isGerman);

    const helpTexts = [
      isChair(occupiedCell.type) ? "" : getTranslation(TranslationKey.EXAMPLE_EMOJI, name),
      fear ? getTranslation(TranslationKey.EXAMPLE_BIG_FEAR, name, fearName, fear) : "",
      smallFear ? getTranslation(TranslationKey.EXAMPLE_SMALL_FEAR, name, smallFearName, smallFear) : "",
      getTranslation(TranslationKey.TARGET_CLICK),
    ];

    helpText.innerHTML = helpTexts
      .filter(Boolean)
      .map((text) => `<p>${text}</p>`)
      .join("");
  } else if (cell) {
    helpCellElementObject = createCellElement(cell);

    if (isTable(cell)) {
      helpText.innerHTML = getTranslation(TranslationKey.INFO_TABLE, (cell.tableIndex ?? 0) + 1);
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
