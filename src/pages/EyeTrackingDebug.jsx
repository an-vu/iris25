import { useCalibration } from "../contexts/CalibrationContext.jsx";
import "../styles/pages/EyeTrackingDebug.css";

export default function EyeTrackingDebug() {
  const {
    eyeTrackingEnabled,
    setEyeTrackingEnabled,
    hasAcceptedCamera,
    acceptCameraAccess,
    declineCameraAccess,
    debugOverlays,
    setDebugOverlays,
  } = useCalibration();

  return (
    <div className="eye-debug background">
      <div className="eye-debug__card">
        <h1>Eye Tracking Debug Lab</h1>
        <p>Use this sandbox to verify WebGazer is streaming gaze data.</p>

        <div className="eye-debug__controls">
          <button
            type="button"
            className="debug-btn primary"
            onClick={() => setEyeTrackingEnabled(true)}
            disabled={eyeTrackingEnabled}
          >
            {eyeTrackingEnabled ? "Iris Enabled" : "Enable Iris"}
          </button>
          <button
            type="button"
            className="debug-btn secondary"
            onClick={declineCameraAccess}
          >
            Disable / Reset
          </button>
          {!hasAcceptedCamera && eyeTrackingEnabled && (
            <button type="button" className="debug-btn primary" onClick={acceptCameraAccess}>
              Allow camera
            </button>
          )}
        </div>

        <button
          type="button"
          className="debug-btn secondary"
          onClick={() => setDebugOverlays((prev) => !prev)}
          disabled={!eyeTrackingEnabled}
        >
          {debugOverlays ? "Hide Debug Overlays" : "Show Debug Overlays"}
        </button>

        <ul className="eye-debug__list">
          <li>Enable Iris to inject WebGazer.</li>
          <li>Accept camera access when prompted.</li>
          <li>Prediction point + video overlays should appear.</li>
          <li>If you don’t see the red dot, open console for WebGazer logs.</li>
        </ul>

        <p className="eye-debug__note">
          This page intentionally has no calibration overlay so you can sanity-check initialization before
          tweaking the main UI.
        </p>
      </div>
    </div>
  );
}
