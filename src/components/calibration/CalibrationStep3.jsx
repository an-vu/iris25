import { createPortal } from "react-dom";
import CalibrationHUD from "./CalibrationHUD.jsx";

export default function CalibrationStep3({
  targetStyle,
  onTargetClick,
  showHud = false,
  step = 0,
  totalSteps = 0,
  message,
  clicksRemaining = 0,
  clickTarget = 0,
  isAccuracyPhase = false,
  accuracyTimeLeft = 0,
  accuracyDuration = 0,
}) {
  const completed = clicksRemaining <= 0;
  const secondsLeft = accuracyDuration
    ? Math.max(0, Math.ceil(accuracyTimeLeft / 1000))
    : 0;

  const clicksTaken = clickTarget - Math.max(clicksRemaining, 0);
  const colorSteps = ["red", "orange", "yellow", "lightgreen", "green"];

  let buttonLabel = "✓";
  if (isAccuracyPhase) {
    buttonLabel = secondsLeft || "✓";
  } else if (!completed) {
    const remaining = Math.max(clicksRemaining, 0);
    buttonLabel = remaining === 0 ? "✓" : remaining;
  }

  const progressIndex = Math.min(colorSteps.length - 1, Math.max(0, clicksTaken));
  const colorClass = isAccuracyPhase
    ? "calibration-click--accuracy"
    : `calibration-click--${colorSteps[progressIndex]}`;

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="calibration-overlay calibration-overlay--blocking">
      <button
        type="button"
        className={["calibration-click", colorClass, completed ? "is-complete" : ""]
          .filter(Boolean)
          .join(" ")}
        style={targetStyle}
        onClick={isAccuracyPhase ? undefined : onTargetClick}
        disabled={isAccuracyPhase || completed}
      >
        {buttonLabel}
      </button>

      {showHud && (
        <CalibrationHUD
          step={step}
          totalSteps={totalSteps}
          message={message}
          clicksRemaining={clicksRemaining}
          clickTarget={clickTarget}
          isAccuracyPhase={isAccuracyPhase}
          accuracySecondsLeft={secondsLeft}
        />
      )}
    </div>,
    document.body
  );
}
