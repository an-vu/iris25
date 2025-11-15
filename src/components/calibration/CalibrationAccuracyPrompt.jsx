export default function CalibrationAccuracyPrompt({ onConfirm }) {
  return (
    <div className="calibration-overlay instructions">
      <div className="calibration-card">
        <h3>Calculating measurement</h3>
        <p>
          Please keep your mouse still and stare at the center dot for the next five seconds. This lets Iris
          measure how accurate the prediction is.
        </p>
        <div className="calibration-actions">
          <button type="button" className="debug-btn primary" onClick={onConfirm}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
