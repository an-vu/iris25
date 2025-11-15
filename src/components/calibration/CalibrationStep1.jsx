import { createPortal } from "react-dom";

export default function CalibrationStep1({ onAllow, onCancel }) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="calibration-consent" role="dialog" aria-modal="true" aria-labelledby="calibration-consent-title">
      <div className="calibration-consent__card">
        <p className="calibration-consent__eyebrow">Iris eye tracking · Calibration Step 1: Camera Access</p>
        <h2 className="calibration-consent__title" id="calibration-consent-title">Calibrate Iris</h2>
        <ul className="calibration-consent__list">
          <li>Press each calibration button five times while keeping your eyes on the target.</li>
          <li>After finishing the nine points, stare at the center dot for five seconds.</li>
          <li>Always follow the mouse with your eyes during calibration.</li>
        </ul>
        <div className="calibration-consent__actions">
          <button type="button" className="consent-btn primary" onClick={onAllow}>
            Allow access to camera
          </button>
          <button type="button" className="consent-btn secondary" onClick={onCancel}>
            Go back
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
