import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import CalibrationStep1A from "./CalibrationStep1A.jsx";
import CalibrationStep1B from "./CalibrationStep1B.jsx";
import CalibrationStep1C from "./CalibrationStep1C.jsx";

const REQUIRED_CLICKS = 5;
const FOCUS_DURATION = 5;

export default function CalibrationStep1({ onAllow, onStart, onCancel }) {
  if (typeof document === "undefined") return null;

  const [cameraGranted, setCameraGranted] = useState(false);
  const [clicksRemaining, setClicksRemaining] = useState(REQUIRED_CLICKS);
  const [focusSecondsLeft, setFocusSecondsLeft] = useState(FOCUS_DURATION);
  const [focusActive, setFocusActive] = useState(false);
  const [focusComplete, setFocusComplete] = useState(false);

  const handleAllowCamera = async () => {
    try {
      await onAllow?.();
      setCameraGranted(true);
    } catch (error) {
      console.error("[Iris] Camera access failed", error);
    }
  };

  const handlePracticeClick = () => {
    if (!cameraGranted || clicksRemaining === 0) return;
    setClicksRemaining((prev) => Math.max(prev - 1, 0));
  };

  const handleFocusStart = () => {
    if (!cameraGranted || clicksRemaining > 0) return;
    setFocusSecondsLeft(FOCUS_DURATION);
    setFocusActive(true);
    setFocusComplete(false);
  };

  useEffect(() => {
    if (!focusActive) return undefined;
    if (focusSecondsLeft <= 0) {
      setFocusActive(false);
      setFocusComplete(true);
      return undefined;
    }
    const timer = window.setTimeout(() => {
      setFocusSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [focusActive, focusSecondsLeft]);

  const step1Complete = cameraGranted;
  const step2Complete = clicksRemaining === 0;
  const step3Complete = focusComplete;
  const allComplete = step1Complete && step2Complete && step3Complete;

  const handleStart = () => {
    if (!allComplete) return;
    onStart?.();
  };

  return createPortal(
    <div
      className="calibration-consent"
      role="dialog"
      aria-modal="true"
      aria-labelledby="calibration-consent-title"
    >
      <div className="calibration-consent__card">
        <p className="calibration-consent__eyebrow">Iris eye tracking · Calibration</p>
        <h2 className="calibration-consent__title" id="calibration-consent-title">
          Calibrate Iris
        </h2>

        <CalibrationStep1A
          complete={step1Complete}
          onAllow={handleAllowCamera}
        />

        <CalibrationStep1B
          complete={step2Complete}
          disabled={!step1Complete}
          clicksRemaining={clicksRemaining}
          totalClicks={REQUIRED_CLICKS}
          onPractice={handlePracticeClick}
        />

        <CalibrationStep1C
          complete={step3Complete}
          disabled={!step2Complete}
          focusSecondsLeft={focusSecondsLeft}
          focusActive={focusActive}
          onStartFocus={handleFocusStart}
        />

        <div className="calibration-actions">
          <button
            type="button"
            className="debug-btn primary"
            disabled={!allComplete}
            onClick={handleStart}
          >
            Start calibration
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
