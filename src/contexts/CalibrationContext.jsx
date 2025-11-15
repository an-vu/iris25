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
import { CalibrationOverlay, CalibrationConsent, AccuracyResultModal } from "../components";

const CalibrationContext = createContext(null);
const CLICK_DWELL_MS = 450;

export function CalibrationProvider({ children }) {
  const [eyeTrackingEnabled, setEyeTrackingEnabled] = useEyeTrackingPreference();
  const [hasAcceptedCamera, setHasAcceptedCamera] = useState(false);
  const [debugOverlays, setDebugOverlays] = useState(false);
  const {
    gaze,
    rawGaze,
    status: engineStatus,
    error,
    start,
    stop,
    pause,
    resume,
    clearData,
    resetSmoothing,
    saveDataAcrossSessions,
    hasInitialSample,
  } = useWebGazerEngine();

  const gazeRef = useRef(null);
  useEffect(() => {
    gazeRef.current = gaze;
  }, [gaze]);

  const rawGazeRef = useRef(null);
  useEffect(() => {
    rawGazeRef.current = rawGaze;
  }, [rawGaze]);

  const [calibrationSequence, setCalibrationSequence] = useState(CALIBRATION_POINTS);
  const [calibrationIndex, setCalibrationIndex] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [isAccuracyPhase, setIsAccuracyPhase] = useState(false);
  const [accuracyTimeLeft, setAccuracyTimeLeft] = useState(0);
  const [accuracyScore, setAccuracyScore] = useState(null);
  const [accuracyQuality, setAccuracyQuality] = useState(null);
  const [showAccuracyModal, setShowAccuracyModal] = useState(false);
  const [showAccuracyPrompt, setShowAccuracyPrompt] = useState(false);
  const [calibrationPhase, setCalibrationPhase] = useState("hidden");
  const [warmUpProgress, setWarmUpProgress] = useState(0);

  const accuracyTimerRef = useRef(null);
  const accuracySamplesRef = useRef([]);
  const hasCalibratedRef = useRef(false);
  const autoPromptedRef = useRef(false);
  const videoMountRef = useRef(null);
  const lastClickTimeRef = useRef(0);

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
    setShowAccuracyPrompt(false);
    setIsAccuracyPhase(false);
  }, []);

  const resetCalibrationState = useCallback(() => {
    setIsCalibrating(false);
    setCalibrationIndex(0);
    setCalibrationSequence(CALIBRATION_POINTS);
    setClickCount(0);
    hasCalibratedRef.current = false;
    autoPromptedRef.current = false;
    clearAccuracyState();
    resetSmoothing();
    hideWebgazerVideo();
    restoreWebgazerVideo();
    setCalibrationPhase("hidden");
    setShowAccuracyPrompt(false);
  }, [clearAccuracyState, resetSmoothing]);

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
    const showDebugVideo = debugOverlays;
    const showPredictionTrail = debugOverlays || isAccuracyPhase;
    window.webgazer.showVideo(showDebugVideo);
    window.webgazer.showFaceOverlay(debugOverlays);
    window.webgazer.showFaceFeedbackBox?.(debugOverlays);
    window.webgazer.showPredictionPoints(showPredictionTrail);
  }, [debugOverlays, isAccuracyPhase, eyeTrackingEnabled, hasAcceptedCamera]);

  const requestCalibration = useCallback(() => {
    clearAccuracyState();
    resetSmoothing();
    setIsCalibrating(false);
    setIsAccuracyPhase(false);
    setCalibrationIndex(0);
    setClickCount(0);
    setCalibrationPhase("instructions");
    autoPromptedRef.current = true;
    setShowAccuracyPrompt(false);
  }, [clearAccuracyState, resetSmoothing]);

  const beginCalibration = useCallback(() => {
    if (!eyeTrackingEnabled || !hasAcceptedCamera || !hasInitialSample) return;
    clearData();
    resetSmoothing();
    setCalibrationSequence(buildCalibrationSequence());
    setCalibrationIndex(0);
    setClickCount(0);
    setIsCalibrating(true);
    setIsAccuracyPhase(false);
    setShowAccuracyModal(false);
    setCalibrationPhase("dots");
    setAccuracyScore(null);
    setAccuracyQuality(null);
    setShowAccuracyPrompt(false);
    resume();
  }, [clearData, eyeTrackingEnabled, hasAcceptedCamera, hasInitialSample, resetSmoothing, resume]);

  const cancelCalibration = useCallback(() => {
    clearAccuracyState();
    resetSmoothing();
    setIsCalibrating(false);
    setIsAccuracyPhase(false);
    setCalibrationIndex(0);
    setClickCount(0);
    setCalibrationPhase("hidden");
    hideWebgazerVideo();
    restoreWebgazerVideo();
    setShowAccuracyPrompt(false);
    autoPromptedRef.current = false;
  }, [clearAccuracyState, resetSmoothing]);

  useEffect(() => {
    if (
      eyeTrackingEnabled &&
      hasAcceptedCamera &&
      engineStatus === EyeTrackingEngineStatus.running &&
      !hasCalibratedRef.current &&
      !autoPromptedRef.current &&
      calibrationPhase === "hidden"
    ) {
      requestCalibration();
    }
  }, [
    requestCalibration,
    eyeTrackingEnabled,
    hasAcceptedCamera,
    engineStatus,
    autoPromptedRef,
    calibrationPhase,
  ]);

  useEffect(() => {
    if (hasInitialSample) {
      setWarmUpProgress(100);
      return;
    }
    setWarmUpProgress(0);
    const intervalId = window.setInterval(() => {
      setWarmUpProgress((prev) => {
        if (prev >= 90) return 90;
        return prev + 5;
      });
    }, 180);
    return () => window.clearInterval(intervalId);
  }, [hasInitialSample]);

  const overlayVisible = calibrationPhase !== "hidden";

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
    setCalibrationPhase("accuracy");
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
      const sample = rawGazeRef.current;
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
        setCalibrationPhase("hidden");
      }
    }, 60);
  }, [saveDataAcrossSessions]);

  const confirmAccuracyPrompt = useCallback(() => {
    setShowAccuracyPrompt(false);
    startAccuracyTest();
  }, [startAccuracyTest]);

  const handleCalibrationClick = useCallback(() => {
    if (!isCalibrating || !currentCalibrationPoint) return;
    const now = performance.now();
    if (now - lastClickTimeRef.current < CLICK_DWELL_MS) return;
    lastClickTimeRef.current = now;
    setClickCount((prev) => {
      const next = prev + 1;
      if (next >= REQUIRED_CLICKS_PER_POINT) {
        const isLastPoint = calibrationIndex >= calibrationSequence.length - 1;
        if (isLastPoint) {
          setIsCalibrating(false);
          setShowAccuracyPrompt(true);
          setCalibrationPhase("preAccuracy");
          return 0;
        }
        setCalibrationIndex((index) => index + 1);
        setClickCount(0);
        return 0;
      }
      return next;
    });
  }, [
    calibrationIndex,
    calibrationSequence.length,
    currentCalibrationPoint,
    isCalibrating,
  ]);

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

  const fallbackTarget = currentCalibrationPoint ?? CALIBRATION_POINTS.find((p) => p.id === "center");
  const targetStyle = fallbackTarget
    ? {
        top: `${fallbackTarget.y * 100}%`,
        left: `${fallbackTarget.x * 100}%`,
      }
    : undefined;

  const contextValue = {
    gaze,
    error,
    status,
    engineStatus,
    eyeTrackingEnabled,
    setEyeTrackingEnabled,
    hasAcceptedCamera,
    isCalibrating,
    calibrationPhase,
    calibrationStep: calibrationIndex,
    clickCount,
    clicksRemaining: Math.max(REQUIRED_CLICKS_PER_POINT - clickCount, 0),
    currentCalibrationPoint,
    overlayVisible,
    consentVisible,
    accuracyScore,
    accuracyQuality,
    showAccuracyModal,
    showAccuracyPrompt,
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
    startCalibration: requestCalibration,
    beginCalibration,
    cancelCalibration,
    confirmAccuracyPrompt,
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
      {overlayVisible && (
        <>
          <div className="camera-float" ref={videoMountRef} />
          <CalibrationOverlay
            phase={calibrationPhase}
            step={calibrationIndex}
            totalSteps={calibrationSequence.length}
            clicksRemaining={Math.max(REQUIRED_CLICKS_PER_POINT - clickCount, 0)}
            clickTarget={REQUIRED_CLICKS_PER_POINT}
            message={currentCalibrationPoint?.label}
            targetStyle={targetStyle}
            onTargetClick={handleCalibrationClick}
            onStart={beginCalibration}
            onCancel={cancelCalibration}
            onConfirmAccuracy={confirmAccuracyPrompt}
            canStart={hasInitialSample}
            warmUpProgress={warmUpProgress}
            isAccuracyPhase={isAccuracyPhase}
            accuracyTimeLeft={accuracyTimeLeft}
            accuracyDuration={ACCURACY_DURATION_MS}
            showAccuracyPrompt={showAccuracyPrompt}
          />
        </>
      )}
      {showAccuracyModal && (
        <AccuracyResultModal
          score={accuracyScore}
          quality={accuracyQuality}
          onRecalibrate={requestCalibration}
          onContinue={dismissAccuracyModal}
        />
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
