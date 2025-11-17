import { createPortal } from "react-dom";

export default function CalibrationStep4Result({ score, quality, pending, onRecalibrate, onContinue }) {
  if (typeof document === "undefined") return null;

  const title = pending
    ? "Calculating accuracy…"
    : `${score != null ? `${score}%` : "--"}${quality ? ` • ${quality}` : ""}`;

  return createPortal(
    <div className="calibration-card">
      <div className="calibration-card__card">
        <p className="calibration-card__eyebrow">Iris eye tracking · Calibration Result</p>
        <h2 className="calibration-card__title">{title}</h2>
        <div className="calibration-actions">
          <button type="button" className="calibration-btn secondary" onClick={onRecalibrate}>
            Recalibrate
          </button>
          <button type="button" className="calibration-btn primary" onClick={onContinue}>
            Start Reading with Iris
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
