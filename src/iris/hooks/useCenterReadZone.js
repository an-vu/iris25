import { useState, useEffect, useRef } from "react";

export function useCenterReadZone() {
  const [centerZoneStyle, setCenterZoneStyle] = useState(null);
  const [centerRect, setCenterRect] = useState(null);

  const centerZoneRef = useRef(null);

  // ----------------------------------------
  // Part 1: Calculate padded center zone style
  // ----------------------------------------
  useEffect(() => {
    let rafId = null;

    const updateCenterZone = () => {
      const button = document.querySelector(".book-card.centered .read-button");
      const container = document.querySelector(".home");

      if (!button || !container) {
        setCenterZoneStyle(null);
        setCenterRect(null);
        return;
      }

      const buttonRect = button.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      const paddedWidth = buttonRect.width * 2;
      const paddedHeight = buttonRect.height * 2;
      const padX = (paddedWidth - buttonRect.width) / 2;
      const padY = (paddedHeight - buttonRect.height) / 2;

      const left = buttonRect.left - containerRect.left - padX;
      const top = buttonRect.top - containerRect.top - padY;

      setCenterZoneStyle({
        left: `${left}px`,
        top: `${top}px`,
        width: `${paddedWidth}px`,
        height: `${paddedHeight}px`,
      });
    };

    const handleResize = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateCenterZone);
    };

    updateCenterZone();
    window.addEventListener("resize", handleResize);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // ----------------------------------------
  // Part 2: Track bounding rect of zone
  // ----------------------------------------
  useEffect(() => {
    if (!centerZoneStyle || !centerZoneRef.current) {
      setCenterRect(null);
      return;
    }

    const updateRect = () => {
      if (!centerZoneRef.current) return;

      const rect = centerZoneRef.current.getBoundingClientRect();
      setCenterRect({
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
      });
    };

    updateRect();
    window.addEventListener("resize", updateRect);

    return () => window.removeEventListener("resize", updateRect);
  }, [centerZoneStyle]);

  return {
    centerZoneRef,
    centerZoneStyle,
    centerRect,
  };
}
