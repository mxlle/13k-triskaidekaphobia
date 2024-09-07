const hasClass = (node: Element, className: string) => node.classList.contains(className);
const firstParent = (e: TouchEvent | MouseEvent, cssClass: string): HTMLElement | undefined => {
  let touchList = (e as TouchEvent).touches;
  if (!touchList?.length) {
    touchList = (e as TouchEvent).changedTouches;
  }

  let el: any = touchList ? document.elementFromPoint(touchList[0].pageX, touchList[0].pageY) : e.target;
  while (el !== document) {
    if (hasClass(el, cssClass)) return el;
    el = el.parentNode;
  }
};

const getOverlayPosition = (e: any) => {
  e = e.touches?.[0] ?? e;
  const target = e.target;
  return {
    left: `${e.pageX - target.offsetWidth / 4}px`,
    top: `${e.pageY - target.offsetHeight / 4}px`,
  };
};

export default (
  rootEl: HTMLElement,
  dragClass: string,
  dropClass: string,
  createOverlay: (dragEl: HTMLElement) => HTMLElement,
  onDrop: (dragEl: HTMLElement, dropEl: HTMLElement, isTouch: boolean) => void,
) => {
  let dragTimeout, isDragging, dragEl, overlayEl, dropEl;

  const pointerdown = (e) => {
    dragTimeout = setTimeout(() => {
      dragTimeout = undefined;
      startDragging(e);
    }, 200);
  };

  const pointerup = (e) => {
    if (dragTimeout) {
      clearTimeout(dragTimeout);
      dragTimeout = undefined;
    }

    dropping(e);
  };

  const startDragging = (e) => {
    isDragging = 1;
    dragEl = firstParent(e, dragClass);
    overlayEl = dragEl && createOverlay(dragEl);
    if (overlayEl) {
      e.preventDefault();
      rootEl.appendChild(overlayEl);
      overlayEl.classList.add("drag-overlay");
      Object.assign(overlayEl.style, {
        position: "fixed",
        pointerEvents: "none",
        zIndex: "9999",
        ...getOverlayPosition(e),
      });
    }
  };
  const pointermove = (e) => {
    if (isDragging && overlayEl) {
      e.preventDefault();
      Object.assign(overlayEl.style, getOverlayPosition(e));
    }
  };
  const dropping = (e) => {
    isDragging = 0;
    if (overlayEl) {
      e.preventDefault();
      overlayEl.remove();
      overlayEl = undefined;
      dropEl = firstParent(e, dropClass);
      const isTouch = e.type === "touchend";
      dropEl && onDrop(dragEl, dropEl, isTouch);
    }
  };
  rootEl.addEventListener("mousedown", pointerdown);
  rootEl.addEventListener("touchstart", pointerdown);
  rootEl.addEventListener("mousemove", pointermove);
  rootEl.addEventListener("touchmove", pointermove, { passive: false });
  rootEl.addEventListener("mouseup", pointerup);
  rootEl.addEventListener("touchend", pointerup);
};
