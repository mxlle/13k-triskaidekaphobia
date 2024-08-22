import "./help.scss";

import { createElement } from "../../utils/html-utils";
import { getTranslation, isGermanLanguage, TranslationKey } from "../../translations";
import { CellType, OccupiedCell } from "../../types";
import { getPhobiaName, getRandomPhobia, getRandomPhobiaExcluding } from "../../phobia";
import { createDialog, Dialog } from "../dialog";
import { createCellElement } from "../game-field/cell-component";

let helpDialog: Dialog | undefined;
let miniHelpDialog: Dialog | undefined;

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

export function openMiniHelp(cell: OccupiedCell): Promise<boolean> {
  if (miniHelpDialog) {
    miniHelpDialog.changeHeader(getTranslation(TranslationKey.ABOUT, cell.person.name));
    miniHelpDialog.recreateDialogContent(getMiniHelpContent(cell));

    return miniHelpDialog.open();
  }

  miniHelpDialog = createDialog(getMiniHelpContent(cell), undefined, getTranslation(TranslationKey.ABOUT, cell.person.name), false, true);
  return miniHelpDialog.open();
}

function getMiniHelpContent(cell: OccupiedCell): HTMLElement {
  const miniHelpContent = createElement({
    cssClass: "rules mini-help",
  });

  const helpVisualization = createElement({
    cssClass: "visualization",
  });

  const exampleCellElementObject = createCellElement(cell);
  const { name, fear, smallFear } = cell.person;

  const isGerman = isGermanLanguage();
  const fearName = getPhobiaName(fear, isGerman);
  const smallFearName = getPhobiaName(smallFear, isGerman);

  const exampleText = createElement({});
  exampleText.innerHTML = `${getTranslation(TranslationKey.EXAMPLE_EMOJI, name)}
${fear ? getTranslation(TranslationKey.EXAMPLE_BIG_FEAR, name, fearName, fear) : ""}
${smallFear ? getTranslation(TranslationKey.EXAMPLE_SMALL_FEAR, name, smallFearName, smallFear) : ""}`;

  helpVisualization.append(exampleText, exampleCellElementObject.elem);

  miniHelpContent.append(helpVisualization);

  return miniHelpContent;
}
