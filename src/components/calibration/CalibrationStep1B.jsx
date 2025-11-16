import NinePointButton from "../buttons/NinePointButton.jsx";

export default function CalibrationStep1b({
  complete,
  disabled,
  clicksRemaining,
  totalClicks = 5,
  onPractice,
}) {
  return (
    <div className={`calibration-step ${disabled ? "is-disabled" : ""}`}>
      <div className="calibration-step__indicator">
        <NinePointButton
          complete={complete}
          disabled={disabled}
          clicksRemaining={clicksRemaining}
          totalClicks={totalClicks}
          onClick={onPractice}
        />
      </div>
      <div className="calibration-step__content">
        <p className="calibration-step__title">Click each calibration point 5 times</p>
        <p className="calibration-step__desc">
          Always follow the cursor with your eyes in this step.
        </p>
      </div>
    </div>
  );
}
