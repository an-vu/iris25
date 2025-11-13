import { createPortal } from "react-dom";

export default function CalibrationConsent({ onAllow, onCancel }) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="calibration-consent">
      <div className="calibration-consent__card">
        <p className="calibration-consent__eyebrow">Iris eye tracking · calibration</p>
        <h2 className="calibration-consent__title">Calibrate Iris</h2>
        <p>
          The red point represent the prediction of your eye movement
          press each calibration button 5 times while looking at the button after finished pressing 9 calibration button,
          stare at the middle dot for 5 seconds for accuracy calculation
          always follow the mouse with your eyes
        </p>
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
