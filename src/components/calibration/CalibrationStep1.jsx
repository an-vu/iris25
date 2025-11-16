import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import CalibrationStep1a from "./CalibrationStep1a.jsx";
import CalibrationStep1b from "./CalibrationStep1b.jsx";
import CalibrationStep1c from "./CalibrationStep1c.jsx";

const REQUIRED_CLICKS = 5;     // How many practice clicks user must complete
const FOCUS_DURATION = 5;      // Seconds user must hold gaze (no input)

// Main wrapper for the first calibration workflow
export default function CalibrationStep1({ onAllow, onStart, onCancel }) {
  // SSR guard
  if (typeof document === "undefined") return null;

  // Step 1: camera permission
  const [cameraGranted, setCameraGranted] = useState(false);

  // Step 2: practice clicking targets
  const [clicksRemaining, setClicksRemaining] = useState(REQUIRED_CLICKS);

  // Step 3: gaze-hold (focus) countdown
  const [focusSecondsLeft, setFocusSecondsLeft] = useState(FOCUS_DURATION);
  const [focusActive, setFocusActive] = useState(false);
  const [focusComplete, setFocusComplete] = useState(false);

  // Request camera permission
  const handleAllowCamera = async () => {
    try {
      await onAllow?.();      // parent triggers actual permission prompt
      setCameraGranted(true);
    } catch (error) {
      console.error("[Iris] Camera access failed", error);
    }
  };

  // Decrease click counter during practice phase
  const handlePracticeClick = () => {
    if (!cameraGranted || clicksRemaining === 0) return;
    setClicksRemaining(prev => Math.max(prev - 1, 0));
  };

  // Derived states for step progress
  const step1Complete = cameraGranted;
  const step2Complete = clicksRemaining === 0;
  const step3Complete = focusComplete;
  const allComplete = step1Complete && step2Complete && step3Complete;

  // Start the gaze-hold timer
  const handleFocusStart = useCallback(() => {
    if (!cameraGranted || clicksRemaining > 0) return;
    setFocusSecondsLeft(FOCUS_DURATION);
    setFocusActive(true);
    setFocusComplete(false);
  }, [cameraGranted, clicksRemaining]);

  // Auto-start gaze-hold when user finishes clicking
  useEffect(() => {
    if (!step2Complete || step3Complete || focusActive) return;
    handleFocusStart();
  }, [step2Complete, step3Complete, focusActive, handleFocusStart]);

  // Run countdown while gaze-hold is active
  useEffect(() => {
    if (!focusActive) return;
    if (focusSecondsLeft <= 0) {
      setFocusActive(false);
      setFocusComplete(true);   // mark step 3 done
      return;
    }
    const timer = setTimeout(() => {
      setFocusSecondsLeft(prev => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearTimeout(timer);
  }, [focusActive, focusSecondsLeft]);

  // Final action: start the real calibration
  const handleStart = () => {
    if (!allComplete) return;
    onStart?.();
  };

  // Render modal in portal
  return createPortal(
    <div
      className="calibration-card"
      role="dialog"
      aria-modal="true"
      aria-labelledby="calibration-card-title"
    >
      <div className="calibration-card__card">
        <p className="calibration-card__eyebrow">Iris eye tracking · Calibration Walkthrough</p>
        <h2 className="calibration-card__title" id="calibration-card-title">
          Calibrate Iris
        </h2>

        {/* Step 1: Allow camera */}
        <CalibrationStep1a
          complete={step1Complete}
          onAllow={handleAllowCamera}
        />

        {/* Step 2: Practice clicking */}
        <CalibrationStep1b
          complete={step2Complete}
          disabled={!step1Complete}
          clicksRemaining={clicksRemaining}
          totalClicks={REQUIRED_CLICKS}
          onPractice={handlePracticeClick}
        />

        {/* Step 3: Hold gaze */}
        <CalibrationStep1c
          complete={step3Complete}
          disabled={!step2Complete}
          focusSecondsLeft={focusSecondsLeft}
          focusActive={focusActive}
          onStartFocus={handleFocusStart}
        />

        <div className="calibration-actions">
          <button
            type="button"
            className="calibration-btn primary"
            disabled={!allComplete}
            onClick={handleStart}
          >
            Start calibration
          </button>
          <button type="button" className="calibration-btn secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
