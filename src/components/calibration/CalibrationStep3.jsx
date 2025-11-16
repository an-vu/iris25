import { createPortal } from "react-dom";

export default function CalibrationStep4({ onConfirm }) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="calibration-overlay instructions">
      <div className="calibration-consent__card">
        <p className="calibration-consent__eyebrow">Iris eye tracking · Step 4 · Accuracy Check</p>
        <h2 className="calibration-consent__title">Hold steady on the center dot</h2>
        <ul className="calibration-consent__list">
          <li>After clicking OK, lift your hands off the mouse/trackpad.</li>
          <li>Stare directly at the center dot for five seconds.</li>
          <li>This final check lets Iris measure how accurate the prediction is.</li>
        </ul>
        <div className="calibration-actions">
          <button type="button" className="debug-btn primary" onClick={onConfirm}>
            OK
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
