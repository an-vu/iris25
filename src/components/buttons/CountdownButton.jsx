import { useEffect, useState } from "react";
import CheckBadgeIcon from "./CheckBadgeIcon.jsx";

export const CALIBRATION_SECONDS = 5;

export default function CountdownButton({
  seconds = CALIBRATION_SECONDS,
  auto = false,
  disabled = false,
  complete,
  value,
  active,
  onStart,
  onComplete,
}) {
  // Internal states only for auto mode
  const [internalActive, setInternalActive] = useState(false);
  const [internalSeconds, setInternalSeconds] = useState(seconds);
  const [internalComplete, setInternalComplete] = useState(false);

  const isAuto = auto === true;
  const isActive = isAuto ? internalActive : active;
  const displayValue = isAuto ? internalSeconds : value;
  const isComplete = isAuto ? internalComplete : complete;

  // NEW: Auto-start countdown when parent sets active=true
  useEffect(() => {
    if (!isAuto) return;
    if (active && !internalActive && !internalComplete) {
      setInternalActive(true);
      setInternalSeconds(seconds);
      onStart?.();
    }
  }, [active, isAuto, internalActive, internalComplete, seconds, onStart]);

  // INTERNAL COUNTDOWN TICKER
  useEffect(() => {
    if (!isAuto) return;
    if (!internalActive || internalComplete) return;

    if (internalSeconds <= 0) {
      setInternalComplete(true);
      onComplete?.();
      return;
    }

    const timer = setTimeout(() => {
      setInternalSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [internalActive, internalSeconds, internalComplete, isAuto, onComplete]);

  // Manual click (only matters in controlled mode or if user starts manually)
  const handleStart = () => {
    if (isActive) return;
    if (disabled || isComplete) return;

    onStart?.();

    if (isAuto) {
      setInternalSeconds(seconds);
      setInternalComplete(false);
      setInternalActive(true);
    }
  };

  const className = [
    "calibration-click",
    isComplete ? "is-complete" : "calibration-click--accuracy",
  ]
    .filter(Boolean)
    .join(" ");

  const label = isComplete ? <CheckBadgeIcon aria-hidden="true" /> : displayValue;

  return (
    <button
      type="button"
      className={className}
      onClick={handleStart}
    >
      {label}
    </button>
  );
}



