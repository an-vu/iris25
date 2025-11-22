import { useEffect, useRef } from "react";

export function useHomeGazeActions({
  zone,
  centerRect,
  handleNext,
  handlePrev,
  triggerScrollWithRepeat,
  stopScrollRepeat,
  centerDwellMs = 750,
  centerCooldownMs = 1200,
  centerRepeatDelayMs = 1200,
}) {
  const lastActionZoneRef = useRef(null);
  const lastCenterTriggerRef = useRef(0);
  const centerTriggerTimerRef = useRef(null);

  useEffect(() => {
    // clear existing center-tap timer
    if (centerTriggerTimerRef.current) {
      clearTimeout(centerTriggerTimerRef.current);
      centerTriggerTimerRef.current = null;
    }

    // stop any scroll-repeat
    stopScrollRepeat();

    // no gaze zone → reset actions
    if (!zone) {
      lastActionZoneRef.current = null;
      return;
    }

    // same zone → ignore repeat
    if (zone === lastActionZoneRef.current) return;
    lastActionZoneRef.current = zone;

    // left scroll
    if (zone === "left") {
      triggerScrollWithRepeat(handlePrev);
    }

    // right scroll
    if (zone === "right") {
      triggerScrollWithRepeat(handleNext);
    }

    // center "read" action
    if (zone === "center" && centerRect) {
      centerTriggerTimerRef.current = setTimeout(() => {
        const now = Date.now();

        // prevent double-taps
        if (now - lastCenterTriggerRef.current < centerCooldownMs) return;
        lastCenterTriggerRef.current = now;

        const btn = document.querySelector(".book-card.centered .read-button");
        if (btn) btn.click();
      }, centerDwellMs + centerRepeatDelayMs);
    }
  }, [
    zone,
    centerRect,
    handleNext,
    handlePrev,
    triggerScrollWithRepeat,
    stopScrollRepeat,
    centerDwellMs,
    centerCooldownMs,
    centerRepeatDelayMs,
  ]);
}
