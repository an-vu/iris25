import CountdownButton from "../buttons/CountdownButton.jsx";

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
        <CountdownButton
          // unified API
          seconds={CALIBRATION_SECONDS}
          auto={false}                     // Step1c uses controlled mode
          disabled={disabled}
          complete={complete}
          value={focusSecondsLeft}
          active={focusActive}
          onStart={handleStart}
          onComplete={() => {
            /* parent already handles marking complete */
          }}
        />
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
