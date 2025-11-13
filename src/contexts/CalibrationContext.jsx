import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import useWebGazerEngine, { EyeTrackingEngineStatus } from "../hooks/useWebGazer.js";
import { useEyeTrackingPreference } from "../hooks/useEyeTrackingPreference.js";
import {
  CALIBRATION_POINTS,
  REQUIRED_CLICKS_PER_POINT,
  ACCURACY_DURATION_MS,
  ACCURACY_THRESHOLD_PX,
  getAccuracyTier,
  buildCalibrationSequence,
} from "../utils/calibrationConfig.js";
import { showWebgazerVideo, hideWebgazerVideo, restoreWebgazerVideo } from "../utils/webgazerVideo.js";
import { CalibrationOverlay, CalibrationConsent } from "../components";

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

  const gazeRef = useRef(null);
  useEffect(() => {
    gazeRef.current = gaze;
  }, [gaze]);

  const [calibrationSequence, setCalibrationSequence] = useState(CALIBRATION_POINTS);
  const [calibrationIndex, setCalibrationIndex] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [isAccuracyPhase, setIsAccuracyPhase] = useState(false);
  const [accuracyTimeLeft, setAccuracyTimeLeft] = useState(0);
  const [accuracyScore, setAccuracyScore] = useState(null);
  const [accuracyQuality, setAccuracyQuality] = useState(null);
  const [showAccuracyModal, setShowAccuracyModal] = useState(false);

  const accuracyTimerRef = useRef(null);
  const accuracySamplesRef = useRef([]);
  const hasCalibratedRef = useRef(false);
  const videoMountRef = useRef(null);

  const currentCalibrationPoint = useMemo(() => calibrationSequence[calibrationIndex] ?? null, [
    calibrationSequence,
    calibrationIndex,
  ]);

  useEffect(() => {
    if (!error) return;
    console.error("[WebGazer] error detected:", error);
  }, [error]);

  const clearAccuracyState = useCallback(() => {
    if (accuracyTimerRef.current) {
      clearInterval(accuracyTimerRef.current);
      accuracyTimerRef.current = null;
    }
    accuracySamplesRef.current = [];
    setAccuracyTimeLeft(0);
    setAccuracyScore(null);
    setAccuracyQuality(null);
    setShowAccuracyModal(false);
    setIsAccuracyPhase(false);
  }, []);

  const resetCalibrationState = useCallback(() => {
    setIsCalibrating(false);
    setCalibrationIndex(0);
    setCalibrationSequence(CALIBRATION_POINTS);
    setClickCount(0);
    hasCalibratedRef.current = false;
    clearAccuracyState();
    hideWebgazerVideo();
    restoreWebgazerVideo();
  }, [clearAccuracyState]);

  const startTracking = useCallback(() => {
    setEyeTrackingEnabled(true);
  }, [setEyeTrackingEnabled]);

  const stopTracking = useCallback(() => {
    setEyeTrackingEnabled(false);
    setHasAcceptedCamera(false);
    resetCalibrationState();
    stop();
  }, [resetCalibrationState, setEyeTrackingEnabled, stop]);

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
    setCalibrationSequence(buildCalibrationSequence());
    setCalibrationIndex(0);
    setClickCount(0);
    setIsCalibrating(true);
    setIsAccuracyPhase(false);
    setShowAccuracyModal(false);
    setAccuracyScore(null);
    setAccuracyQuality(null);
  }, [clearData, eyeTrackingEnabled, hasAcceptedCamera]);

  useEffect(() => {
    if (
      eyeTrackingEnabled &&
      hasAcceptedCamera &&
      engineStatus === EyeTrackingEngineStatus.running &&
      !hasCalibratedRef.current &&
      !isCalibrating &&
      !isAccuracyPhase
    ) {
      beginCalibration();
    }
  }, [
    beginCalibration,
    eyeTrackingEnabled,
    hasAcceptedCamera,
    engineStatus,
    isCalibrating,
    isAccuracyPhase,
  ]);

  const overlayVisible = Boolean((isCalibrating || isAccuracyPhase) && currentCalibrationPoint);

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

  useEffect(() => () => clearAccuracyState(), [clearAccuracyState]);

  const startAccuracyTest = useCallback(() => {
    setIsCalibrating(false);
    setIsAccuracyPhase(true);
    setShowAccuracyModal(false);
    accuracySamplesRef.current = [];
    setAccuracyTimeLeft(ACCURACY_DURATION_MS);
    if (accuracyTimerRef.current) {
      clearInterval(accuracyTimerRef.current);
    }
    const startedAt = performance.now();
    accuracyTimerRef.current = window.setInterval(() => {
      const now = performance.now();
      const elapsed = now - startedAt;
      setAccuracyTimeLeft(Math.max(0, ACCURACY_DURATION_MS - elapsed));
      const sample = gazeRef.current;
      if (sample && sample.x != null && sample.y != null) {
        accuracySamplesRef.current.push({ x: sample.x, y: sample.y });
      }
      if (elapsed >= ACCURACY_DURATION_MS) {
        window.clearInterval(accuracyTimerRef.current);
        accuracyTimerRef.current = null;
        const samples = accuracySamplesRef.current.slice();
        const centerX = window.innerWidth * 0.5;
        const centerY = window.innerHeight * 0.5;
        const avgDistance =
          samples.length === 0
            ? ACCURACY_THRESHOLD_PX
            : samples.reduce(
                (sum, point) => sum + Math.hypot(point.x - centerX, point.y - centerY),
                0
              ) / samples.length;
        const ratio = Math.max(0, 1 - avgDistance / ACCURACY_THRESHOLD_PX);
        const score = Math.round(ratio * 100);
        const quality = getAccuracyTier(score);
        setAccuracyScore(score);
        setAccuracyQuality(quality);
        setIsAccuracyPhase(false);
        hasCalibratedRef.current = true;
        saveDataAcrossSessions(true);
        setShowAccuracyModal(true);
      }
    }, 60);
  }, [saveDataAcrossSessions]);

  const handleCalibrationClick = useCallback(() => {
    if (!isCalibrating || !currentCalibrationPoint) return;
    setClickCount((prev) => {
      const next = prev + 1;
      if (next >= REQUIRED_CLICKS_PER_POINT) {
        const isLastPoint = calibrationIndex >= calibrationSequence.length - 1;
        if (isLastPoint) {
          startAccuracyTest();
        } else {
          setCalibrationIndex((index) => index + 1);
          setClickCount(0);
        }
        return 0;
      }
      return next;
    });
  }, [calibrationIndex, calibrationSequence.length, currentCalibrationPoint, isCalibrating, startAccuracyTest]);

  const finishCalibration = useCallback(() => {
    setShowAccuracyModal(false);
  }, []);

  const dismissAccuracyModal = useCallback(() => {
    setShowAccuracyModal(false);
  }, []);

  const consentVisible = eyeTrackingEnabled && !hasAcceptedCamera;

  const status = useMemo(() => {
    if (!eyeTrackingEnabled) return "idle";
    if (engineStatus === EyeTrackingEngineStatus.loading) return "loading";
    if (!hasAcceptedCamera) return "initializing";
    if (engineStatus === EyeTrackingEngineStatus.error) return "error";
    if (engineStatus === EyeTrackingEngineStatus.paused) return "paused";
    if (isAccuracyPhase) return "accuracy";
    if (isCalibrating) return "calibrating";
    if (engineStatus === EyeTrackingEngineStatus.running) {
      return hasCalibratedRef.current ? "ready" : "initializing";
    }
    return "initializing";
  }, [eyeTrackingEnabled, engineStatus, hasAcceptedCamera, isAccuracyPhase, isCalibrating]);

  const contextValue = {
    gaze,
    error,
    status,
    engineStatus,
    eyeTrackingEnabled,
    setEyeTrackingEnabled,
    hasAcceptedCamera,
    isCalibrating,
    calibrationStep: calibrationIndex,
    clickCount,
    clicksRemaining: Math.max(REQUIRED_CLICKS_PER_POINT - clickCount, 0),
    currentCalibrationPoint,
    overlayVisible,
    consentVisible,
    accuracyScore,
    accuracyQuality,
    showAccuracyModal,
    accuracyTimeLeft,
    isAccuracyPhase,
    acceptCameraAccess: () => setHasAcceptedCamera(true),
    declineCameraAccess: () => {
      setHasAcceptedCamera(false);
      setEyeTrackingEnabled(false);
    },
    debugOverlays,
    setDebugOverlays,
    startTracking,
    stopTracking,
    pauseTracking: pause,
    resumeTracking: resume,
    resetTracking: () => {
      stopTracking();
      resetCalibrationState();
    },
    startCalibration: beginCalibration,
    handleCalibrationClick,
    startAccuracyTest,
    finishCalibration,
    dismissAccuracyModal,
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
          <div className="camera-float" ref={videoMountRef} />
          <CalibrationOverlay
            step={calibrationIndex}
            totalSteps={calibrationSequence.length}
            clicksRemaining={Math.max(REQUIRED_CLICKS_PER_POINT - clickCount, 0)}
            clickTarget={REQUIRED_CLICKS_PER_POINT}
            message={currentCalibrationPoint.label}
            targetStyle={{
              top: `calc(${currentCalibrationPoint.y * 100}% - 24px)`,
              left: `calc(${currentCalibrationPoint.x * 100}% - 24px)`,
            }}
            onTargetClick={handleCalibrationClick}
            isAccuracyPhase={isAccuracyPhase}
            accuracyTimeLeft={accuracyTimeLeft}
            accuracyDuration={ACCURACY_DURATION_MS}
          />
        </>
      )}
      {showAccuracyModal && (
        <div className="calibration-modal">
          <div className="calibration-modal__card">
            <h3>Calibration Complete</h3>
            <p className="calibration-modal__score">
              {accuracyScore != null ? `${accuracyScore}%` : "--"}{" "}
              {accuracyQuality ? `• ${accuracyQuality}` : ""}
            </p>
            <p className="calibration-modal__note">
              You can recalibrate anytime from the Iris menu if accuracy drifts.
            </p>
            <button type="button" className="debug-btn primary" onClick={dismissAccuracyModal}>
              Continue
            </button>
          </div>
        </div>
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
