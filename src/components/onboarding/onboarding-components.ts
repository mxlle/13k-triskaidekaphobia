import { createElement } from "../../utils/html-utils";

import "./onboarding-components.scss";

export const enum Direction {
  UP = "up",
  DOWN = "down",
  LEFT = "left",
  RIGHT = "right",
}

export function getOnboardingArrow(direction: Direction): HTMLElement {
  const arrow = createElement({
    cssClass: `arrow ${direction}`,
  });

  const arrowInner = createElement({
    cssClass: "arrow-inner",
  });

  arrow.append(arrowInner);

  return arrow;
}
