import NinePointButton from "../buttons/NinePointButton.jsx";

export default function CalibrationStep1B({
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
        <p className="calibration-step__title">Practice calibration clicks</p>
        <ul className="calibration-consent__list">
          <li>Press each calibration button five times while keeping your eyes on the target.</li>
          <li>Always follow the mouse with your eyes during calibration.</li>
        </ul>
      </div>
    </div>
  );
}
