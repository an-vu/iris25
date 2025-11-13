// src/components/calibration/CalibrationOverlay.jsx
import CalibrationHUD from "./CalibrationHUD.jsx";

export default function CalibrationOverlay({
  phase,
  step,
  totalSteps,
  clicksRemaining,
  clickTarget,
  message,
  targetStyle,
  onTargetClick,
  onStart,
  onCancel,
  onConfirmAccuracy,
  isAccuracyPhase = false,
  accuracyTimeLeft = 0,
  accuracyDuration = 0,
  showAccuracyPrompt = false,
  showHud = false,
}) {
  if (phase === "instructions") {
    return (
      <div className="calibration-overlay instructions">
        <div className="calibration-card">
          <h3>Iris Eye Calibration</h3>
          <p>
            Click each of the nine points five times while keeping your eyes on the button and following your
            cursor with your eyes. This teaches Iris how your gaze maps to the screen.
          </p>
          <p className="calibration-note subtle">When you finish all nine points we’ll measure overall accuracy in one last step.</p>
          <div className="calibration-actions">
            <button type="button" className="debug-btn secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="button" className="debug-btn primary" onClick={onStart}>
              Start calibrating
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "preAccuracy" && showAccuracyPrompt) {
    return (
      <div className="calibration-overlay instructions">
        <div className="calibration-card">
          <h3>Calculating measurement</h3>
          <p>
            Please keep your mouse still and stare at the center dot for the next five seconds. This lets Iris
            measure how accurate the prediction is.
          </p>
          <div className="calibration-actions">
            <button type="button" className="debug-btn primary" onClick={onConfirmAccuracy}>
              OK
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase !== "dots" && phase !== "accuracy") return null;

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
