import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import useWebGazer from "../hooks/useWebGazer.js";
import { useEyeTrackingPreference } from "../hooks/useEyeTrackingPreference.js";
import {
  CALIBRATION_POSITIONS,
  POSITION_STYLES,
  hideWebgazerVideo,
  restoreWebgazerVideo,
  showWebgazerVideo,
} from "../utils/webgazerCalibrate.js";
import { CalibrationOverlay, CalibrationConsent } from "../components";

const CAL_STEP_DURATION = 10000;
const CAMERA_FLOAT_STYLE = {
  top: "12px",
  left: "50%",
  transform: "translateX(-50%)",
};

const CalibrationContext = createContext(null);

export function CalibrationProvider({ children }) {
  const [eyeTrackingEnabled, setEyeTrackingEnabled] = useEyeTrackingPreference();
  const [hasAcceptedCamera, setHasAcceptedCamera] = useState(false);
  const [debugOverlays, setDebugOverlays] = useState(false);
  const { gaze, isReady, error } = useWebGazer(eyeTrackingEnabled && hasAcceptedCamera, debugOverlays);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationStep, setCalibrationStep] = useState(-1);
  const [calibrationCountdown, setCalibrationCountdown] = useState(0);
  const hasCalibratedRef = useRef(false);
  const videoMountRef = useRef(null);

  const currentCalibrationPoint = useMemo(() => {
    if (calibrationStep < 0 || calibrationStep >= CALIBRATION_POSITIONS.length) return null;
    return CALIBRATION_POSITIONS[calibrationStep];
  }, [calibrationStep]);

  useEffect(() => {
    if (error) {
      console.error("[WebGazer] error detected:", error);
    }
  }, [error]);

  // Reset everything when the user turns Iris off.
  useEffect(() => {
    if (eyeTrackingEnabled) return;
    setHasAcceptedCamera(false);
    setIsCalibrating(false);
    setCalibrationStep(-1);
    setCalibrationCountdown(0);
    hasCalibratedRef.current = false;
    hideWebgazerVideo();
    restoreWebgazerVideo();
  }, [eyeTrackingEnabled]);

  // Start calibration once the tracker is ready and we have consent.
  useEffect(() => {
    if (!eyeTrackingEnabled || !hasAcceptedCamera) return;
    if (!isReady || hasCalibratedRef.current) return;
    setIsCalibrating(true);
    setCalibrationStep(0);
  }, [eyeTrackingEnabled, hasAcceptedCamera, isReady]);

  // Drive each calibration waypoint.
  useEffect(() => {
    if (!eyeTrackingEnabled || !hasAcceptedCamera || !isCalibrating || calibrationStep < 0) return;

    if (calibrationStep >= CALIBRATION_POSITIONS.length) {
      hideWebgazerVideo();
      restoreWebgazerVideo();
      hasCalibratedRef.current = true;
      setIsCalibrating(false);
      setCalibrationCountdown(0);
      return;
    }

    const currentPoint = CALIBRATION_POSITIONS[calibrationStep];

    let rafId = null;
    const mountVideo = () => {
      const mountTarget = videoMountRef.current;
      if (!mountTarget) {
        rafId = requestAnimationFrame(mountVideo);
        return;
      }
      showWebgazerVideo("camera-float", mountTarget);
    };
    mountVideo();
    setCalibrationCountdown(CAL_STEP_DURATION / 1000);

    let remaining = CAL_STEP_DURATION / 1000;
    const countdownInterval = setInterval(() => {
      remaining -= 1;
      setCalibrationCountdown(Math.max(0, remaining));
    }, 1000);

    const stepTimeout = setTimeout(() => {
      setCalibrationStep((prev) => prev + 1);
    }, CAL_STEP_DURATION);

    return () => {
      clearInterval(countdownInterval);
      clearTimeout(stepTimeout);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [eyeTrackingEnabled, hasAcceptedCamera, isCalibrating, calibrationStep]);

  useEffect(() => {
    return () => {
      hideWebgazerVideo();
      restoreWebgazerVideo();
    };
  }, []);

  const overlayVisible =
    eyeTrackingEnabled && hasAcceptedCamera && isCalibrating && calibrationStep >= 0;

  const consentVisible = eyeTrackingEnabled && !hasAcceptedCamera;

  const contextValue = {
    gaze,
    isReady,
    error,
    eyeTrackingEnabled,
    setEyeTrackingEnabled,
    hasAcceptedCamera,
    isCalibrating,
    calibrationStep,
    calibrationCountdown,
    currentCalibrationPoint,
    overlayVisible,
    consentVisible,
    acceptCameraAccess: () => setHasAcceptedCamera(true),
    declineCameraAccess: () => {
      setHasAcceptedCamera(false);
      setEyeTrackingEnabled(false);
    },
    debugOverlays,
    setDebugOverlays,
  };

  return (
    <CalibrationContext.Provider value={contextValue}>
      {children}
      {consentVisible && (
        <CalibrationConsent onAllow={() => setHasAcceptedCamera(true)} onCancel={() => {
          setHasAcceptedCamera(false);
          setEyeTrackingEnabled(false);
        }} />
      )}
      {overlayVisible && currentCalibrationPoint && (
        <>
          <div className="camera-float" ref={videoMountRef} style={CAMERA_FLOAT_STYLE} />
          <CalibrationOverlay
            step={Math.min(calibrationStep, CALIBRATION_POSITIONS.length - 1)}
            totalSteps={CALIBRATION_POSITIONS.length}
            countdown={calibrationCountdown}
            message={currentCalibrationPoint.label}
            positionStyle={POSITION_STYLES[currentCalibrationPoint.id]}
            positionId={currentCalibrationPoint.id}
          />
        </>
      )}
    </CalibrationContext.Provider>
  );
}

export function useCalibration() {
  const ctx = useContext(CalibrationContext);
  if (!ctx) {
    throw new Error("useCalibration must be used within a CalibrationProvider");
  }
  return ctx;
}
