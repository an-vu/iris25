export default function CalibrationHUD({
  step,
  totalSteps,
  message,
  clicksRemaining,
  clickTarget,
  isAccuracyPhase,
  accuracySecondsLeft,
}) {
  return (
    <div className="calibration-info">
      <p className="calibration-step">
        Point {Math.min(step + 1, totalSteps)} / {totalSteps}
      </p>
      {!isAccuracyPhase && message && <h3 className="calibration-message">{message}</h3>}
      {isAccuracyPhase ? (
        <>
          <p className="calibration-note">
            Hold your gaze on the center dot for {accuracySecondsLeft}s to measure overall accuracy.
          </p>
          <p className="calibration-note subtle">
            Stay steady—this quick check helps Iris map your eyes more precisely.
          </p>
        </>
      ) : (
        <>
          <p className="calibration-note">
            {clicksRemaining <= 0
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
  );
}
