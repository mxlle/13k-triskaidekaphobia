import { sleep } from "./promise-utils";

export function addCanvasToBody() {
  const canvas = createElement({ tag: "canvas" });
  document.body.appendChild(canvas);
  return canvas;
}

export function createElement({ tag, cssClass, text, onClick }) {
  const elem = document.createElement(tag || "div");
  if (cssClass) elem.classList.add(...cssClass.split(" "));
  if (text) {
    const textNode = document.createTextNode(text);
    elem.appendChild(textNode);
  }
  if (onClick) {
    elem.addEventListener("click", onClick);
  }
  return elem;
}

export function appendRainbowCapableText(element, text) {
  element.appendChild(createElement({ tag: "span", text, cssClass: "rbc" }));
}

export function createButton({ text, onClick, iconBtn, rbc }) {
  const button = createElement({
    tag: "button",
    cssClass: iconBtn ? "icon-btn" : "",
    onClick,
  });
  if (text) {
    if (rbc) {
      appendRainbowCapableText(button, text);
    } else {
      button.innerHTML = text;
    }
  }
  return button;
}

function absorbEvent_(event) {
  event.preventDefault && event.preventDefault();
  event.stopPropagation && event.stopPropagation();
  event.cancelBubble = true;
  event.returnValue = false;
  return false;
}

export function convertLongPressToClick(
  node,
  clickHandler,
  touchingClassTimeout = 300
) {
  function onTouchEnd(event, promise, target) {
    promise.then(() => target.classList.remove("touching"));
    return absorbEvent_(event);
  }

  const explicitPassiveOption = { passive: false }; // https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md#solution-the-passive-option
  const innerEventOptions = { ...explicitPassiveOption, once: true };

  node.addEventListener(
    "touchstart",
    function (event) {
      const target = event.currentTarget;
      target.classList.add("touching");
      clickHandler && clickHandler(event);
      const sleepPromise = sleep(touchingClassTimeout);
      node.addEventListener(
        "touchend",
        (_event) => onTouchEnd(_event, sleepPromise, target),
        innerEventOptions
      );
      node.addEventListener("touchmove", absorbEvent_, innerEventOptions);
      node.addEventListener("touchcancel", absorbEvent_, innerEventOptions);

      return absorbEvent_(event);
    },
    explicitPassiveOption
  );
}

export function addBodyClasses(...classes) {
  document.body.classList.add(...classes);
}

export function removeBodyClasses(...classes) {
  document.body.classList.remove(...classes);
}

export function setBodyStyleProperty(prop, value) {
  document.body.style.setProperty(prop, value);
}

export function setElementToWindowSize(element) {
  element.width = window.innerWidth;
  element.height = window.innerHeight;
}

export function getWidthHeightScale(baseResolution) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const resolution = width * height;
  // adapt object size based on screen size
  const scale = Math.sqrt(resolution) / Math.sqrt(baseResolution);
  return { width, height, scale };
}

export function getPositionFromEvent(event) {
  let x =
    event.type === "touchstart"
      ? event.changedTouches[0]?.clientX
      : event.clientX;
  let y =
    event.type === "touchstart"
      ? event.changedTouches[0]?.clientY
      : event.clientY;

  if (!x) {
    x = window.innerWidth / 2;
  }

  if (!y) {
    y = window.innerHeight / 2;
  }

  return { x, y };
}
