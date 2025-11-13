// This is the fucking brain haha 
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import useWebGazerEngine, { EyeTrackingEngineStatus } from "../hooks/useWebGazer.js";
import { useEyeTrackingPreference } from "../hooks/useEyeTrackingPreference.js";
import {
  CALIBRATION_POSITIONS,
  hideWebgazerVideo,
  restoreWebgazerVideo,
  showWebgazerVideo,
} from "../utils/webgazerCalibrate.js";
import { CalibrationOverlay, CalibrationConsent } from "../components";

const CLICKS_PER_POINT = 5;
const CAMERA_FLOAT_STYLE = {
  top: "12px",
  left: "50%",
  transform: "translateX(-50%)",
};

const getOverlayStyle = (point) => ({
  top: `calc(${point.y * 100}% - 24px)`,
  left: `calc(${point.x * 100}% - 24px)`,
});

const CalibrationContext = createContext(null);

export function CalibrationProvider({ children }) {
  const [eyeTrackingEnabled, setEyeTrackingEnabled] = useEyeTrackingPreference();
  const [hasAcceptedCamera, setHasAcceptedCamera] = useState(false);
  const [debugOverlays, setDebugOverlays] = useState(false);
  const {
    gaze,
    status: engineStatus,
    error,
    start,
    stop,
    pause,
    resume,
    clearData,
    saveDataAcrossSessions,
  } = useWebGazerEngine();
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationStep, setCalibrationStep] = useState(-1);
  const [clickCount, setClickCount] = useState(0);
  const hasCalibratedRef = useRef(false);
  const videoMountRef = useRef(null);

  const currentCalibrationPoint = useMemo(() => {
    if (calibrationStep < 0 || calibrationStep >= CALIBRATION_POSITIONS.length) return null;
    return CALIBRATION_POSITIONS[calibrationStep];
  }, [calibrationStep]);

  useEffect(() => {
    if (!error) return;
    console.error("[WebGazer] error detected:", error);
  }, [error]);

  const resetCalibrationState = useCallback(() => {
    setIsCalibrating(false);
    setCalibrationStep(-1);
    setClickCount(0);
    hasCalibratedRef.current = false;
    hideWebgazerVideo();
    restoreWebgazerVideo();
  }, []);

  useEffect(() => {
    if (eyeTrackingEnabled && hasAcceptedCamera) {
      start();
    } else {
      stop();
      resetCalibrationState();
    }
  }, [eyeTrackingEnabled, hasAcceptedCamera, start, stop, resetCalibrationState]);

  useEffect(() => {
    if (!window?.webgazer || !eyeTrackingEnabled || !hasAcceptedCamera) return;
    window.webgazer.showVideo(debugOverlays);
    window.webgazer.showFaceOverlay(debugOverlays);
    window.webgazer.showFaceFeedbackBox?.(debugOverlays);
    window.webgazer.showPredictionPoints(debugOverlays);
  }, [debugOverlays, eyeTrackingEnabled, hasAcceptedCamera]);

  const beginCalibration = useCallback(() => {
    if (!eyeTrackingEnabled || !hasAcceptedCamera) return;
    clearData();
    setClickCount(0);
    setIsCalibrating(true);
    setCalibrationStep(0);
  }, [clearData, eyeTrackingEnabled, hasAcceptedCamera]);

  useEffect(() => {
    if (
      eyeTrackingEnabled &&
      hasAcceptedCamera &&
      engineStatus === EyeTrackingEngineStatus.running &&
      !hasCalibratedRef.current &&
      !isCalibrating
    ) {
      beginCalibration();
    }
  }, [
    beginCalibration,
    engineStatus,
    eyeTrackingEnabled,
    hasAcceptedCamera,
    isCalibrating,
  ]);

  const overlayVisible =
    eyeTrackingEnabled &&
    hasAcceptedCamera &&
    isCalibrating &&
    calibrationStep >= 0 &&
    calibrationStep < CALIBRATION_POSITIONS.length;

  useEffect(() => {
    if (!overlayVisible) return;
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
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [overlayVisible]);

  useEffect(() => {
    return () => {
      hideWebgazerVideo();
      restoreWebgazerVideo();
    };
  }, []);

  const finishCalibration = useCallback(() => {
    hideWebgazerVideo();
    restoreWebgazerVideo();
    saveDataAcrossSessions(true);
    hasCalibratedRef.current = true;
    setIsCalibrating(false);
    setCalibrationStep(-1);
    setClickCount(0);
  }, [saveDataAcrossSessions]);

  const handleCalibrationClick = useCallback(() => {
    if (
      !isCalibrating ||
      calibrationStep < 0 ||
      calibrationStep >= CALIBRATION_POSITIONS.length
    ) {
      return;
    }
    setClickCount((prev) => {
      const next = prev + 1;
      if (next >= CLICKS_PER_POINT) {
        const isLastPoint = calibrationStep >= CALIBRATION_POSITIONS.length - 1;
        if (isLastPoint) {
          finishCalibration();
        } else {
          setCalibrationStep((step) => step + 1);
        }
        return 0;
      }
      return next;
    });
  }, [isCalibrating, calibrationStep, finishCalibration]);

  const consentVisible = eyeTrackingEnabled && !hasAcceptedCamera;
  const clicksRemaining = Math.max(CLICKS_PER_POINT - clickCount, 0);

  const derivedStatus = useMemo(() => {
    if (!eyeTrackingEnabled) return "disabled";
    if (!hasAcceptedCamera) return "awaiting-camera";
    if (isCalibrating) return "calibrating";
    if (engineStatus === EyeTrackingEngineStatus.paused) return "paused";
    if (engineStatus === EyeTrackingEngineStatus.running) {
      return hasCalibratedRef.current ? "ready" : "initializing";
    }
    return engineStatus;
  }, [eyeTrackingEnabled, hasAcceptedCamera, isCalibrating, engineStatus]);

  const contextValue = {
    gaze,
    error,
    status: derivedStatus,
    engineStatus,
    eyeTrackingEnabled,
    setEyeTrackingEnabled,
    hasAcceptedCamera,
    isCalibrating,
    calibrationStep,
    clickCount,
    clicksRemaining,
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
    beginCalibration,
    pauseTracking: pause,
    resumeTracking: resume,
    resetTracking: () => {
      stop();
      resetCalibrationState();
    },
  };

  return (
    <CalibrationContext.Provider value={contextValue}>
      {children}
      {consentVisible && (
        <CalibrationConsent
          onAllow={() => setHasAcceptedCamera(true)}
          onCancel={() => {
            setHasAcceptedCamera(false);
            setEyeTrackingEnabled(false);
          }}
        />
      )}
      {overlayVisible && currentCalibrationPoint && (
        <>
          <div className="camera-float" ref={videoMountRef} style={CAMERA_FLOAT_STYLE} />
          <CalibrationOverlay
            step={calibrationStep}
            totalSteps={CALIBRATION_POSITIONS.length}
            clicksRemaining={clicksRemaining}
            clickTarget={CLICKS_PER_POINT}
            message={currentCalibrationPoint.label}
            targetStyle={getOverlayStyle(currentCalibrationPoint)}
            onTargetClick={handleCalibrationClick}
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
