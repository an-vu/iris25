import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Handles home page navigation state and repeated scrolling.
 */
export function useHomeNavigation(totalBooks) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const repeatTimeoutRef = useRef(null);
  const repeatIntervalRef = useRef(null);
  const repeatDelayMs = 1000;
  const repeatIntervalMs = 700;

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => Math.min(prev + 1, totalBooks - 1));
  }, [totalBooks]);

  const handlePrev = useCallback(() => {
    setSelectedIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const stopScrollRepeat = useCallback(() => {
    if (repeatTimeoutRef.current) {
      clearTimeout(repeatTimeoutRef.current);
      repeatTimeoutRef.current = null;
    }
    if (repeatIntervalRef.current) {
      clearInterval(repeatIntervalRef.current);
      repeatIntervalRef.current = null;
    }
  }, []);

  const triggerScrollWithRepeat = useCallback(
    (fn) => {
      if (typeof fn !== "function") return;
      stopScrollRepeat();
      fn();
      repeatTimeoutRef.current = setTimeout(() => {
        repeatIntervalRef.current = setInterval(fn, repeatIntervalMs);
      }, repeatDelayMs);
    },
    [stopScrollRepeat],
  );

  useEffect(() => stopScrollRepeat, [stopScrollRepeat]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleNext, handlePrev]);

  return {
    selectedIndex,
    handleNext,
    handlePrev,
    triggerScrollWithRepeat,
    stopScrollRepeat,
  };
}
