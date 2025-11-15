import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import useWebGazerEngine, { EyeTrackingEngineStatus } from "../hooks/useWebGazer.js";
import { useIrisToggle } from "../../hooks/useIrisToggle.js";
import { useCalibrationAccuracy } from "../hooks/useCalibrationAccuracy.js";
// import { useWebgazerVideoMount } from "../hooks/useWebgazerVideoMount.js"; // Disabled: relying on WebGazer's default camera UI for now.
import {
  CALIBRATION_POINTS,
  REQUIRED_CLICKS_PER_POINT,
  ACCURACY_DURATION_MS,
  buildCalibrationSequence,
} from "../utils/calibrationConfig.js";
import { hideWebgazerVideo, restoreWebgazerVideo } from "../utils/webgazerVideo.js";
import {
  CalibrationStep2,
  CalibrationStep1,
  CalibrationDots,
  CalibrationAccuracyPrompt,
  AccuracyResultModal,
} from "../../components";

const IrisCalibrationContext = createContext(null);
const CLICK_DWELL_MS = 450;

export function IrisCalibrationManager({ children }) {
  const [eyeTrackingEnabled, setEyeTrackingEnabled] = useIrisToggle();
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
  const [calibrationPhase, setCalibrationPhase] = useState("hidden");
  const [warmUpProgress, setWarmUpProgress] = useState(0);

  const hasCalibratedRef = useRef(false);
  const autoPromptedRef = useRef(false);
  const lastClickTimeRef = useRef(0);

  const {
    isAccuracyPhase,
    accuracyTimeLeft,
    accuracyScore,
    accuracyQuality,
    showAccuracyModal,
    showAccuracyPrompt,
    setShowAccuracyPrompt,
    clearAccuracyState,
    startAccuracyTest,
    confirmAccuracyPrompt,
    dismissAccuracyModal,
  } = useCalibrationAccuracy({
    rawGazeRef,
    onTestStart: () => {
      setCalibrationPhase("accuracy");
      setIsCalibrating(false);
    },
    onTestComplete: () => {
      hasCalibratedRef.current = true;
      saveDataAcrossSessions(true);
      setCalibrationPhase("hidden");
    },
  });

  const currentCalibrationPoint = useMemo(() => calibrationSequence[calibrationIndex] ?? null, [
    calibrationSequence,
    calibrationIndex,
  ]);

  useEffect(() => {
    if (!error) return;
    console.error("[WebGazer] error detected:", error);
  }, [error]);

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

  // NOTE: Keeping WebGazer's built-in video/overlay settings for now so we can compare behavior
  // with the stock implementation. Re-enable this effect when we want the custom debug toggles back.
  /*
  useEffect(() => {
    if (!window?.webgazer || !eyeTrackingEnabled || !hasAcceptedCamera) return;
    const showDebugVideo = debugOverlays;
    const showPredictionTrail = debugOverlays || isAccuracyPhase;
    window.webgazer.showVideo(showDebugVideo);
    window.webgazer.showFaceOverlay(debugOverlays);
    window.webgazer.showFaceFeedbackBox?.(debugOverlays);
    window.webgazer.showPredictionPoints(showPredictionTrail);
  }, [debugOverlays, isAccuracyPhase, eyeTrackingEnabled, hasAcceptedCamera]);
  */

  const requestCalibration = useCallback(() => {
    clearAccuracyState();
    resetSmoothing();
    setIsCalibrating(false);
    setCalibrationIndex(0);
    setClickCount(0);
    setCalibrationPhase("instructions");
    autoPromptedRef.current = true;
    setShowAccuracyPrompt(false);
  }, [clearAccuracyState, resetSmoothing]);

  const beginCalibration = useCallback(() => {
    if (!eyeTrackingEnabled || !hasAcceptedCamera || !hasInitialSample) return;
    clearData();
    clearAccuracyState();
    resetSmoothing();
    setCalibrationSequence(buildCalibrationSequence());
    setCalibrationIndex(0);
    setClickCount(0);
    setIsCalibrating(true);
    setCalibrationPhase("dots");
    setShowAccuracyPrompt(false);
    resume();
  }, [
    clearAccuracyState,
    clearData,
    eyeTrackingEnabled,
    hasAcceptedCamera,
    hasInitialSample,
    resetSmoothing,
    resume,
  ]);

  const cancelCalibration = useCallback(() => {
    clearAccuracyState();
    resetSmoothing();
    setIsCalibrating(false);
    setCalibrationIndex(0);
    setClickCount(0);
    setCalibrationPhase("hidden");
    hideWebgazerVideo();
    restoreWebgazerVideo();
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
  // const videoMountRef = useWebgazerVideoMount(overlayVisible); // Custom mounting disabled temporarily.
  const videoMountRef = useRef(null); // Placeholder ref so existing JSX keeps working while defaults are used.

  useEffect(() => () => clearAccuracyState(), [clearAccuracyState]);

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
    finishCalibration: dismissAccuracyModal,
    dismissAccuracyModal,
  };

  let overlayContent = null;
  if (calibrationPhase === "instructions") {
    overlayContent = (
      <CalibrationStep2
        canStart={hasInitialSample}
        warmUpProgress={warmUpProgress}
        onStart={beginCalibration}
        onCancel={cancelCalibration}
      />
    );
  } else if (calibrationPhase === "preAccuracy" && showAccuracyPrompt) {
    overlayContent = <CalibrationAccuracyPrompt onConfirm={confirmAccuracyPrompt} />;
  } else if (calibrationPhase === "dots" || calibrationPhase === "accuracy") {
    overlayContent = (
      <CalibrationDots
        targetStyle={targetStyle}
        onTargetClick={handleCalibrationClick}
        onCancel={cancelCalibration}
        showHud
        step={calibrationIndex}
        totalSteps={calibrationSequence.length}
        message={currentCalibrationPoint?.label}
        clicksRemaining={Math.max(REQUIRED_CLICKS_PER_POINT - clickCount, 0)}
        clickTarget={REQUIRED_CLICKS_PER_POINT}
        isAccuracyPhase={isAccuracyPhase}
        accuracyTimeLeft={accuracyTimeLeft}
        accuracyDuration={ACCURACY_DURATION_MS}
      />
    );
  }

  return (
    <IrisCalibrationContext.Provider value={contextValue}>
      {children}
      {consentVisible && (
        <CalibrationStep1
          onAllow={() => setHasAcceptedCamera(true)}
          onCancel={() => {
            setHasAcceptedCamera(false);
            setEyeTrackingEnabled(false);
          }}
        />
      )}
      {overlayVisible && overlayContent && (
        <>
          {/* The floating camera placeholder stays mounted even though the custom WebGazer video injection is paused. */}
          <div className="camera-float" ref={videoMountRef} />
          {overlayContent}
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
    </IrisCalibrationContext.Provider>
  );
}

export function useCalibration() {
  const ctx = useContext(IrisCalibrationContext);
  if (!ctx) {
    throw new Error("useCalibration must be used within an IrisCalibrationManager");
  }
  return ctx;
}
