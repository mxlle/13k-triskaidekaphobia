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

  const miniHelpContent = createElement({
    cssClass: "mini-help",
  });

  const exampleHeading = createElement({
    tag: "h3",
    text: getTranslation(TranslationKey.ABOUT, name),
  });

  const exampleText = createElement({});
  let exampleCellElementObject: CellElementObject | undefined;

  if (occupiedCell) {
    exampleCellElementObject = createCellElement(occupiedCell);
    const { name, fear, smallFear } = occupiedCell.person;

    const isGerman = isGermanLanguage();
    const fearName = getPhobiaName(fear, isGerman);
    const smallFearName = getPhobiaName(smallFear, isGerman);

    const exampleTexts = [
      isChair(occupiedCell.type) ? "" : getTranslation(TranslationKey.EXAMPLE_EMOJI, name),
      fear ? getTranslation(TranslationKey.EXAMPLE_BIG_FEAR, name, fearName, fear) : "",
      smallFear ? getTranslation(TranslationKey.EXAMPLE_SMALL_FEAR, name, smallFearName, smallFear) : "",
    ];

    exampleText.innerHTML = exampleTexts
      .filter(Boolean)
      .map((text) => `<p>${text}</p>`)
      .join("");
  } else if (cell) {
    exampleCellElementObject = createCellElement(cell);

    if (isTable(cell)) {
      exampleText.innerHTML = getTranslation(TranslationKey.INFO_TABLE, (cell.tableIndex ?? 0) + 1);
    } else {
      exampleText.innerHTML = getTranslation(
        isChair(cell.type) ? TranslationKey.INFO_CHAIR : isEmpty(cell) ? TranslationKey.INFO_EMPTY : TranslationKey.INFO_DECOR,
      );
    }
  } else {
    exampleText.innerHTML = getTranslation(TranslationKey.INFO_PLACEHOLDER);
  }

  miniHelpContent.append(exampleHeading, exampleText);

  if (exampleCellElementObject) {
    miniHelpContent.append(exampleCellElementObject.elem);
  } else {
    const placeholder = createElement({
      cssClass: "cell",
      text: "?",
    });
    miniHelpContent.append(placeholder);
  }

  return miniHelpContent;
}
