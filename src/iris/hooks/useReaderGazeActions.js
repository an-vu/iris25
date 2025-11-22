import { useEffect, useRef } from "react";

/**
 * Wires reader gaze zones to scroll actions with repeat.
 */
export function useReaderGazeActions({
  zone,
  onScrollUp,
  onScrollDown,
  dwellDelayMs = 0,
  repeatDelayMs = 700,
  repeatIntervalMs = 1000,
  minIntervalMs = 200,
  accelStepMs = 150,
}) {
  const lastZoneRef = useRef(null);
  const repeatTimeoutRef = useRef(null);
  const dwellTimerRef = useRef(null);
  const currentIntervalRef = useRef(repeatIntervalMs);

  useEffect(() => {
    const clearAll = () => {
      if (repeatTimeoutRef.current) {
        clearTimeout(repeatTimeoutRef.current);
        repeatTimeoutRef.current = null;
      }
      if (dwellTimerRef.current) {
        clearTimeout(dwellTimerRef.current);
        dwellTimerRef.current = null;
      }
      currentIntervalRef.current = repeatIntervalMs;
    };

    clearAll();

    if (!zone) {
      lastZoneRef.current = null;
      return;
    }
    if (zone === lastZoneRef.current) return;
    lastZoneRef.current = zone;

    const triggerWithRepeat = (fn) => {
      if (typeof fn !== "function") return;
      const start = () => {
        fn();
        currentIntervalRef.current = repeatIntervalMs;
        const scheduleNext = () => {
          const nextInterval = Math.max(minIntervalMs, currentIntervalRef.current - accelStepMs);
          currentIntervalRef.current = nextInterval;
          repeatTimeoutRef.current = setTimeout(() => {
            fn();
            scheduleNext();
          }, currentIntervalRef.current);
        };
        repeatTimeoutRef.current = setTimeout(scheduleNext, repeatDelayMs);
      };
      if (dwellDelayMs > 0) {
        dwellTimerRef.current = setTimeout(start, dwellDelayMs);
      } else {
        start();
      }
    };

    if (zone === "top") {
      triggerWithRepeat(onScrollUp);
    } else if (zone === "bottom") {
      triggerWithRepeat(onScrollDown);
    }

    return clearAll;
  }, [
    zone,
    onScrollUp,
    onScrollDown,
    dwellDelayMs,
    repeatDelayMs,
    repeatIntervalMs,
    minIntervalMs,
    accelStepMs,
  ]);
}
