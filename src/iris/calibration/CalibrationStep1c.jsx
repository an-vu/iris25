import CountdownButton from "../../components/buttons/CountdownButton.jsx";

export const CALIBRATION_SECONDS = 5;

export default function CalibrationStep1c({
  complete,            // parent sets true when countdown finishes
  disabled,            // parent prevents starting early
  focusSecondsLeft,    // parent-controlled countdown value
  focusActive,         // parent tells button "countdown is running"
  onStartFocus,        // parent handles starting countdown
}) {
  const handleStart = () => {
    if (disabled || complete) return;
    onStartFocus?.();           // tells parent to activate countdown
  };

  return (
    <div className={`calibration-step ${disabled ? "is-disabled" : ""}`}>
      <div className="calibration-step__indicator">
        <div style={{ pointerEvents: "none" }}>
          <CountdownButton
            seconds={CALIBRATION_SECONDS}
            auto={false}
            disabled={true}
            className="is-disabled"   // match your real disabled class
            complete={complete}
            value={focusSecondsLeft}
            active={false}            // also freeze animation
            onStart={() => { }}
          />
        </div>
      </div>

      <div className="calibration-step__content">
        <p className="calibration-step__title">
          Focus on the button for 5 seconds without clicking
        </p>
        <p className="calibration-step__desc">
          Don’t move your mouse during this step.
        </p>
      </div>
    </div>
  );
}
