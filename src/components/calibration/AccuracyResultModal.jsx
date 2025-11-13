export default function AccuracyResultModal({ score, quality, onRecalibrate, onContinue }) {
  return (
    <div className="calibration-modal">
      <div className="calibration-modal__card">
        <h3>Calibration Complete</h3>
        <p className="calibration-modal__score">
          {score != null ? `${score}%` : "--"}{" "}
          {quality ? `• ${quality}` : ""}
        </p>
        <p className="calibration-modal__note">
          {quality === "Excellent" || quality === "Good"
            ? "Tracking should work well across the screen."
            : quality === "Medium"
            ? "Usable, but you may see drift near the corners."
            : "Try recalibrating or adjusting lighting."}
        </p>
        <div className="calibration-actions">
          <button type="button" className="debug-btn secondary" onClick={onRecalibrate}>
            Recalibrate
          </button>
          <button type="button" className="debug-btn primary" onClick={onContinue}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
