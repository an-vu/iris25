import { createPortal } from "react-dom";

export default function CalibrationStep2({ onStart, onCancel }) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="calibration-consent">
      <div className="calibration-consent__card">
        <p className="calibration-consent__eyebrow">Iris eye tracking · Step 2 · 9-point calibration</p>
        <h2 className="calibration-consent__title">Calibrate Iris</h2>
        <ul className="calibration-consent__list">
          <li>Click each of the nine points five times while keeping your eyes on it.</li>
          <li>Keep following your mouse with your eyes the entire time.</li>
        </ul>
        <div className="calibration-actions">
          <button type="button" className="debug-btn primary" onClick={onStart}>
            Start calibrating
          </button>
          <button type="button" className="consent-btn secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
