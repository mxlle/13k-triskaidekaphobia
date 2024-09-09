import { createButton, createElement } from "../../utils/html-utils";

import "./index.scss";
import { getTranslation, TranslationKey } from "../../translations/i18n";

let zIndexCounter = 50; // start at 50 to be above regular content

export interface Dialog {
  open: (openImmediately?: boolean) => Promise<boolean>;
  close: (isSubmit?: boolean) => void;
  toggleSubmitDisabled: (isDisabled: boolean) => void;
  recreateDialogContent: (newInnerElement: HTMLElement) => void;
  changeSubmitText: (newText: string) => void;
}

export function createDialog(innerElement: HTMLElement, submitButtonText?: string): Dialog {
  const dialog = createElement({
    cssClass: "dialog",
    onClick: (event) => event.stopPropagation(), // TODO - why?
  });

  const dialogContent = createElement({ cssClass: "content" });
  dialogContent.appendChild(innerElement);
  dialog.appendChild(dialogContent);

  function closeDialog() {
    zIndexCounter--;
    dialog.classList.remove("open");
  }

  let buttons, cancelButton, submitButton;
  if (submitButtonText !== undefined) {
    buttons = createElement({ cssClass: "btns" });

    cancelButton = createButton({
      text: getTranslation(TranslationKey.BACK),
      onClick: closeDialog,
    });
    buttons.appendChild(cancelButton);
    submitButton = createButton({
      text: submitButtonText,
      onClick: closeDialog,
    });
    submitButton.classList.add("prm");
    buttons.appendChild(submitButton);
    dialog.appendChild(buttons);
  }

  dialog.appendChild(createButton({ text: "X", onClick: closeDialog, iconBtn: true }));

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

      dialogContent.classList.toggle("ovrflw", dialogContent.scrollHeight > dialogContent.clientHeight);

      dialogContent.scrollTop = 0;

      return new Promise((resolve, _reject) => {
        cancelButton?.addEventListener("click", () => resolve(false));
        submitButton?.addEventListener("click", () => resolve(true));
      });
    },
    close: (isSubmit: boolean) => {
      if (isSubmit) {
        submitButton.click();
        return;
      }

      closeDialog();
    },
    toggleSubmitDisabled: (isDisabled) => {
      if (submitButton) submitButton.disabled = isDisabled;
    },
    recreateDialogContent: (newInnerElement) => {
      dialogContent.innerHTML = "";
      dialogContent.appendChild(newInnerElement);
    },
    changeSubmitText: (newText: string) => {
      if (submitButton) submitButton.innerText = newText;
    },
  };
}
