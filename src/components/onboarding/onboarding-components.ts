import { createElement } from "../../utils/html-utils";

import "./onboarding-components.scss";

import arrowIcon from "./arrow-fat.svg";

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

  arrow.append(arrowIcon());

  return arrow;
}
