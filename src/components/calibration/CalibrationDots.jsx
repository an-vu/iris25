import CalibrationHUD from "./CalibrationHUD.jsx";

export default function CalibrationDots({
  targetStyle,
  onTargetClick,
  onCancel,
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

  const buttonLabel = isAccuracyPhase
    ? secondsLeft || "✓"
    : completed
    ? "✓"
    : clicksRemaining;

  return (
    <div className="calibration-overlay">
      {typeof onCancel === "function" && (
        <button type="button" className="debug-btn secondary calibration-cancel" onClick={onCancel}>
          Cancel
        </button>
      )}
      <button
        type="button"
        className={`calibration-click ${completed ? "is-complete" : ""}`}
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
    </div>
  );
}
