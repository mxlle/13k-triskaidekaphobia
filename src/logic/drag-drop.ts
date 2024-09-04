const hasClass = (node: Element, className: string) => node.classList.contains(className);
const firstParent = (e: TouchEvent | MouseEvent, cssClass: string): HTMLElement | undefined => {
  let el: any = "touches" in e ? document.elementFromPoint(e.touches[0].pageX, e.touches[0].pageY) : e.target;
  while (el !== document) {
    if (hasClass(el, cssClass)) return el;
    el = el.parentNode;
  }
};

const getOverlayPosition = (e: any) => {
  e = e.touches?.[0] ?? e;
  return {
    left: `${e.pageX - 8}px`,
    top: `${e.pageY - 8}px`,
  };
};

export default (
  rootEl: HTMLElement,
  dragClass: string,
  dropClass: string,
  createOverlay: (dragEl: HTMLElement) => HTMLElement,
  onDrop: (dragEl: HTMLElement, dropEl: HTMLElement) => void,
) => {
  let isDragging, dragEl, overlayEl, dropEl;

  const pointerdown = (e) => {
    e.preventDefault();
    isDragging = 1;
    dragEl = firstParent(e, dragClass);
    overlayEl = dragEl && createOverlay(dragEl);
    if (overlayEl) {
      rootEl.appendChild(overlayEl);
      Object.assign(overlayEl.style, {
        position: "fixed",
        pointerEvents: "none",
        zIndex: "9999",
        ...getOverlayPosition(e),
      });
    }
  };
  const pointermove = (e) => {
    e.preventDefault();
    if (isDragging && overlayEl) {
      Object.assign(overlayEl.style, getOverlayPosition(e));
    }
  };
  const pointerup = (e) => {
    e.preventDefault();
    isDragging = 0;
    if (overlayEl) {
      overlayEl.remove();
      dropEl = firstParent(e, dropClass);
      dropEl && onDrop(dragEl, dropEl);
    }
  };
  rootEl.addEventListener("mousedown", pointerdown);
  rootEl.addEventListener("touchstart", pointerdown);
  rootEl.addEventListener("mousemove", pointermove);
  rootEl.addEventListener("touchmove", pointermove, { passive: false });
  rootEl.addEventListener("mouseup", pointerup);
  rootEl.addEventListener("touchend", pointerup);
};
