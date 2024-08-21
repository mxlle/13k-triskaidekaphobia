import "./help.scss";

import { createElement } from "../../utils/html-utils";
import { getTranslation, isGermanLanguage, TranslationKey } from "../../translations";
import { CellType, OccupiedCell } from "../../types";
import { getPhobiaName } from "../../phobia";
import { createDialog, Dialog } from "../dialog";
import { createCellElement } from "../game-field/cell-component";
import { getRandomPhobia, getRandomPhobiaExcluding } from "../../logic/initialize";

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
    const name = getRandomPhobia();
    const fear = getRandomPhobiaExcluding([name]);
    const smallFear = getRandomPhobiaExcluding([name, fear]);
    const exampleCell: OccupiedCell = {
      type: CellType.CHAIR,
      content: CellType.CHAIR,
      row: -1,
      column: -1,
      person: {
        name,
        fear,
        smallFear,
        afraidOf: [],
        makesAfraid: [],
        hasPanic: false,
      },
    };
    const exampleCellElementObject = createCellElement(exampleCell);

    const isGerman = isGermanLanguage();
    const fearName = getPhobiaName(fear, isGerman);
    const smallFearName = getPhobiaName(smallFear, isGerman);

    const exampleHeading = createElement({
      tag: "h3",
      text: getTranslation(TranslationKey.EXAMPLE),
    });
    const exampleText = createElement({});
    exampleText.innerHTML = `${getTranslation(TranslationKey.EXAMPLE_EMOJI, name)}<br/>
${getTranslation(TranslationKey.EXAMPLE_BIG_FEAR, name, fearName, fear)}<br/>
${getTranslation(TranslationKey.EXAMPLE_SMALL_FEAR, name, smallFearName, smallFear)}`;

    helpVisualization.append(exampleHeading, exampleText, exampleCellElementObject.elem);

    helpContent.append(helpText, helpVisualization);

    helpDialog = createDialog(helpContent, undefined, getTranslation(TranslationKey.RULES));
  }

  helpDialog.open();
}
