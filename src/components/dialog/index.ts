import { createButton, createElement } from "../../utils/html-utils";

import "./index.scss";
import { getTranslation, TranslationKey } from "../../translations";

let zIndexCounter = 10; // start at 5 to be above regular content

export interface Dialog {
  open: (openImmediately?: boolean) => Promise<boolean>;
  close: () => void;
  changeHeader: (headerText: string) => void;
  toggleSubmitDisabled: (isDisabled: boolean) => void;
  recreateDialogContent: (newInnerElement: HTMLElement) => void;
}

export function createDialog(
  innerElement: HTMLElement,
  submitButtonText?: string,
  headerText?: string,
  shineThrough = false,
): Dialog {
  const dialog = createElement({
    cssClass: "dialog",
    onClick: (event) => event.stopPropagation(), // TODO - why?
  });

  if (shineThrough) {
    dialog.classList.add("shine-through");
  }

  let header;
  if (headerText) {
    header = createElement({
      tag: "h2",
      text: headerText,
    });
    dialog.appendChild(header);
    dialog.classList.add("has-header");
  }

  const dialogContent = createElement({ cssClass: "content" });
  dialogContent.appendChild(innerElement);
  dialog.appendChild(dialogContent);

  function closeDialog() {
    zIndexCounter--;
    dialog.classList.remove("open");
    //setTimeout(() => document.body.removeChild(dialog), 700);
  }

  let buttons, cancelButton, submitButton;
  if (submitButtonText !== undefined) {
    buttons = createElement({ cssClass: "btns" });

    cancelButton = createButton({
      text: getTranslation(TranslationKey.CANCEL),
      onClick: closeDialog,
    });
    buttons.appendChild(cancelButton);
    submitButton = createButton({
      text: submitButtonText,
      onClick: closeDialog,
    });
    submitButton.classList.add("primary-btn");
    buttons.appendChild(submitButton);
    dialog.appendChild(buttons);
  }

  dialog.appendChild(
    createButton({ text: "X", onClick: closeDialog, iconBtn: true }),
  );

  document.body.appendChild(dialog);

  return {
    open: (openImmediately) => {
      //document.body.appendChild(dialog);
      zIndexCounter++;
      dialog.style.zIndex = zIndexCounter.toString();
      if (openImmediately) {
        dialog.classList.add("open");
      } else {
        setTimeout(() => dialog.classList.add("open"), 0);
      }

      dialogContent.classList.toggle(
        "is-overflowing",
        dialogContent.scrollHeight > dialogContent.clientHeight,
      );

      dialogContent.scrollTop = 0;

      return new Promise((resolve, _reject) => {
        cancelButton?.addEventListener("click", () => resolve(false));
        submitButton?.addEventListener("click", () => resolve(true));
      });
    },
    close: () => closeDialog(),
    changeHeader: (newHeaderText) => {
      if (header) header.innerText = newHeaderText;
    },
    toggleSubmitDisabled: (isDisabled) => {
      if (submitButton) submitButton.disabled = isDisabled;
    },
    recreateDialogContent: (newInnerElement) => {
      dialogContent.innerHTML = "";
      dialogContent.appendChild(newInnerElement);
    },
  };
}
