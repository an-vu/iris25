// src/components/CalibrationOverlay.jsx
import "../styles/CalibrationOverlay.css";

export default function CalibrationOverlay({
  step,
  totalSteps,
  countdown,
  message,
  positionStyle,
  videoRef,
}) {
  if (step < 0) return null;

  return (
    <div className="calibration-overlay">
      <div className="calibration-card" style={positionStyle}>
        <div className="calibration-content">
          <div className="calibration-video" ref={videoRef} />
          <div className="calibration-text">
            <p className="calibration-step">
              CALIBRATION STEP {step + 1} / {totalSteps}
            </p>
            <h3 className="calibration-message">{message}</h3>
            <p className="calibration-countdown">{countdown}s</p>
            <p className="calibration-note">
              Keep your eyes on the highlighted area.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
