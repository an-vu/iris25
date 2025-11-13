// src/components/calibration/CalibrationOverlay.jsx

import { useEffect, useMemo, useState } from "react";

const CLICK_TARGET = 5;

export default function CalibrationOverlay({
  step,
  totalSteps,
  countdown,
  message,
  positionStyle,
  positionId,
}) {
  if (step < 0) return null;
  const [clicksRemaining, setClicksRemaining] = useState(CLICK_TARGET);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setClicksRemaining(CLICK_TARGET);
    setCompleted(false);
  }, [step]);

  const handleClick = () => {
    if (completed) return;
    setClicksRemaining((prev) => {
      const next = Math.max(prev - 1, 0);
      if (next === 0) setCompleted(true);
      return next;
    });
  };

  const buttonLabel = completed ? "✓" : clicksRemaining;

  const buttonPositionClass = useMemo(() => {
    switch (positionId) {
      case "top-left":
        return "calibration-click--tl";
      case "top-right":
        return "calibration-click--tr";
      case "bottom-right":
        return "calibration-click--br";
      case "bottom-left":
        return "calibration-click--bl";
      case "center":
      default:
        return "calibration-click--center";
    }
  }, [positionId]);

  return (
    <div className="calibration-overlay">
      <div
        className={`calibration-card-wrapper ${positionId === "center" ? "center-layout" : ""}`}
        style={positionStyle}
      >
        <button
          type="button"
          className={`calibration-click ${buttonPositionClass} ${completed ? "is-complete" : ""}`}
          onClick={handleClick}
        >
          {buttonLabel}
        </button>
        <div className="calibration-card">
        <div className="calibration-content">
          <div className="calibration-text">
            <p className="calibration-step">
              CALIBRATION STEP {step + 1} / {totalSteps}
            </p>
            <h3 className="calibration-message">{message}</h3>
            <p className="calibration-countdown">{countdown}s</p>
            <p className="calibration-note">
              Keep your eyes on the highlighted area.
            </p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
