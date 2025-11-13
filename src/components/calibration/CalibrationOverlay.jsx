// src/components/calibration/CalibrationOverlay.jsx

export default function CalibrationOverlay({
  step,
  totalSteps,
  clicksRemaining,
  clickTarget,
  message,
  targetStyle,
  onTargetClick,
}) {
  if (step < 0) return null;
  const completed = clicksRemaining <= 0;
  const buttonLabel = completed ? "✓" : clicksRemaining;

  return (
    <div className="calibration-overlay">
      <button
        type="button"
        className={`calibration-click ${completed ? "is-complete" : ""}`}
        style={targetStyle}
        onClick={onTargetClick}
        disabled={completed}
      >
        {buttonLabel}
      </button>

      <div className="calibration-info">
        <p className="calibration-step">
          Point {Math.min(step + 1, totalSteps)} / {totalSteps}
        </p>
        <h3 className="calibration-message">{message}</h3>
        <p className="calibration-note">
          {completed
            ? "Great! Moving to the next point..."
            : `Click the dot ${clicksRemaining} more time${clicksRemaining === 1 ? "" : "s"} while keeping your eyes on it.`}
        </p>
        <p className="calibration-note subtle">
          Each click teaches Iris where you’re looking. {clickTarget} clicks per point gives the most reliable mapping.
        </p>
      </div>
    </div>
  );
}
