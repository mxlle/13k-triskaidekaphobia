import "./help.scss";

import { createElement } from "../../utils/html-utils";
import {
  getTranslation,
  isGermanLanguage,
  TranslationKey,
} from "../../translations";
import { getRandomPhobia, getRandomPhobiaExcluding } from "../../game-logic";
import { Cell, CellType } from "../../types";
import { createCellElement } from "../game-field";
import { getPhobiaName } from "../../phobia";
import { createDialog, Dialog } from "../dialog";

let helpDialog: Dialog | undefined;

export function openHelp() {
  if (!helpDialog) {
    const helpContent = createElement({
      cssClass: "rules",
    });

    const helpText = createElement({});
    helpText.innerHTML = getTranslation(TranslationKey.RULES_CONTENT);

    const helpVisualization = createElement({
      cssClass: "visualization",
    });
    const content = getRandomPhobia();
    const fear = getRandomPhobiaExcluding([content]);
    const smallFear = getRandomPhobiaExcluding([content, fear]);
    const exampleCell: Cell = {
      type: CellType.CHAIR,
      content,
      fear,
      smallFear,
      row: -1,
      column: -1,
    };
    createCellElement(exampleCell);

    const isGerman = isGermanLanguage();
    const fearName = getPhobiaName(fear, isGerman);
    const smallFearName = getPhobiaName(smallFear, isGerman);

    const exampleHeading = createElement({
      tag: "h3",
      text: getTranslation(TranslationKey.EXAMPLE),
    });
    const exampleText = createElement({});
    exampleText.innerHTML = `${getTranslation(TranslationKey.EXAMPLE_EMOJI, content)}<br/>
${getTranslation(TranslationKey.EXAMPLE_BIG_FEAR, content, fearName, fear)}<br/>
${getTranslation(TranslationKey.EXAMPLE_SMALL_FEAR, content, smallFearName, smallFear)}`;

    helpVisualization.append(exampleHeading, exampleText, exampleCell.elem);

    helpContent.append(helpText, helpVisualization);

    helpDialog = createDialog(
      helpContent,
      undefined,
      getTranslation(TranslationKey.RULES),
    );
  }

  helpDialog.open();
}
