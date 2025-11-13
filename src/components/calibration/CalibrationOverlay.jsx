// src/components/calibration/CalibrationOverlay.jsx

export default function CalibrationOverlay({
  step,
  totalSteps,
  clicksRemaining,
  clickTarget,
  message,
  targetStyle,
  onTargetClick,
  isAccuracyPhase = false,
  accuracyTimeLeft = 0,
  accuracyDuration = 0,
}) {
  if (step < 0) return null;
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

      <div className="calibration-info">
        <p className="calibration-step">
          Point {Math.min(step + 1, totalSteps)} / {totalSteps}
        </p>
        <h3 className="calibration-message">{message}</h3>
        {isAccuracyPhase ? (
          <>
            <p className="calibration-note">
              Hold your gaze on the center dot for {secondsLeft}s to measure overall accuracy.
            </p>
            <p className="calibration-note subtle">
              Stay steady—this quick check helps Iris map your eyes more precisely.
            </p>
          </>
        ) : (
          <>
            <p className="calibration-note">
              {completed
                ? "Great! Moving to the next point..."
                : `Click the dot ${clicksRemaining} more time${
                    clicksRemaining === 1 ? "" : "s"
                  } while keeping your eyes on it.`}
            </p>
            <p className="calibration-note subtle">
              Each click teaches Iris where you’re looking. {clickTarget} clicks per point keeps accuracy solid.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
