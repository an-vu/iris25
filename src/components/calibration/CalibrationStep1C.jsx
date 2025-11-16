import CountdownButton from "../buttons/CountdownButton.jsx";

const FOCUS_TOTAL = 5;

export default function CalibrationStep1C({
  complete,
  disabled,
  focusSecondsLeft,
  focusActive,
  onStartFocus,
}) {
  const clicksRemaining =
    focusActive && focusSecondsLeft > 0
      ? focusSecondsLeft
      : complete
      ? 0
      : FOCUS_TOTAL;

  const handleClick = () => {
    if (disabled || complete || focusActive) return;
    onStartFocus?.();
  };

  return (
    <div className={`calibration-step ${disabled ? "is-disabled" : ""}`}>
      <div className="calibration-step__indicator">
        <CountdownButton
          complete={complete}
          disabled={disabled}
          value={clicksRemaining}
          onStart={handleClick}
          active={focusActive}
        />
      </div>
      <div className="calibration-step__content">
        <p className="calibration-step__title">Hold steady for 5 seconds</p>
        <p className="calibration-step__desc">
          After finishing the nine points, stare at the center dot for five seconds.
        </p>
      </div>
    </div>
  );
}
