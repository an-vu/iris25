import { createPortal } from "react-dom";
import "../styles/CalibrationConsent.css";

export default function CalibrationConsent({ onAllow, onCancel }) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="calibration-consent">
      <div className="calibration-consent__card">
        <p className="calibration-consent__eyebrow">Iris eye tracking · calibration</p>
        <h2 className="calibration-consent__title">Calibrate your gaze to scroll hands-free</h2>
        <p>
          Iris needs a quick fifty-second calibration so it can match your eye movement to the
          document. When a white circle appears, look straight at it, move your cursor to the same
          spot, and click five times while keeping your gaze steady. After ten seconds the circle
          shifts to the next corner and finally the center.
        </p>
        <ul className="calibration-consent__list">
          <li>Order: top-left → top-right → bottom-right → bottom-left → center.</li>
          <li>Each waypoint lasts ten seconds, so the entire run takes about fifty seconds.</li>
          <li>You can skip Iris at any time and keep using touch or your mouse.</li>
        </ul>
        <p className="calibration-consent__note">
          Iris needs access to your camera to understand where you are looking. Footage never leaves
          your device.
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
