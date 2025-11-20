import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

// Hook that reads/updates the Iris ON/OFF toggle (stored in localStorage or state)
import { useIrisToggle } from "./hooks/useIrisToggle.js";
import { useWebGazer } from "./hooks/useWebGazer.js"; // This connect Iris to WebGazer

// First calibration UI popup component
import CalibrationStep1 from "./calibration/CalibrationStep1.jsx";
import CalibrationStep2 from "./calibration/CalibrationStep2.jsx";
import CalibrationStep3 from "./calibration/CalibrationStep3.jsx";
import CalibrationStep4Result from "./calibration/CalibrationStep4Result.jsx";


// Creates a React Context for anything related to Iris state
const IrisContext = createContext(null);

export function IrisManager({ children }) {
  // irisEnabled = boolean for ON/OFF state of Iris
  // setIrisEnabled = function to change the ON/OFF state
  const [irisEnabled, setIrisEnabled] = useIrisToggle();
  // hasCalibrated = whether the user already finished calibration
  const [hasCalibrated, setHasCalibrated] = useState(false);
  // showCalibrationStep1 = whether to show CalibrationStep1
  const [showCalibrationStep1, setShowCalibrationStep1] = useState(false);
  const [showCalibrationStep2, setShowCalibrationStep2] = useState(false);
  const [showCalibrationStep3, setShowCalibrationStep3] = useState(false);
  const [showCalibrationResult, setShowCalibrationResult] = useState(false);
  const [accuracyPending, setAccuracyPending] = useState(false);
  const [accuracyScore, setAccuracyScore] = useState(null);
  const [accuracyQuality, setAccuracyQuality] = useState(null);
  const {
    initialize: initWebGazer,
    startCalibration: startWebGazerCalibration,
    finishCalibration: finishWebGazerCalibration,
    startTracking,
    stopTracking,
    shutdown,
    measurePrecision,
    restartCalibration,
    toggleKalmanFilter,
    enableTraining,
    disableTraining,
  } = useWebGazer({ autoInit: false });
  const accuracyPromiseRef = useRef(null);

  // Runs every time irisEnabled or hasCalibrated changes
  useEffect(() => {
    if (irisEnabled) {
      // If Iris is ON but calibration has NOT been done, show the calibration popup
      if (!hasCalibrated) setShowCalibrationStep1(true);
    } else {
      // If Iris turns OFF, hide popup and reset calibration state
      setShowCalibrationStep1(false);
      setHasCalibrated(false);
      setShowCalibrationStep2(false);
      setShowCalibrationStep3(false);
      setShowCalibrationResult(false);
    }
  }, [irisEnabled, hasCalibrated]); // Dependencies: run when these change

  // Runs when user clicks "Allow camera"
  const handleAllowCamera = async () => {
    try {
      await initWebGazer();
    } catch (error) {
      console.error("Failed to initialize WebGazer:", error);
      handleCancelCalibration();
    }
  };

  const handleBeginCalibration = async () => {
    setShowCalibrationStep1(false);
    setShowCalibrationStep2(true);
    try {
      enableTraining();
      await startWebGazerCalibration();
    } catch (error) {
      console.error("Failed to start WebGazer calibration:", error);
      handleCancelCalibration();
    }
  };

  const handleCompleteDots = () => {
    setShowCalibrationStep2(false);
    setShowCalibrationStep3(true);
    accuracyPromiseRef.current = null;
    toggleKalmanFilter(false);
  };

  const handleCountdownBegin = () => {
    accuracyPromiseRef.current = measurePrecision();
  };

  const handleFocusComplete = async () => {
    setShowCalibrationStep3(false);
    setShowCalibrationResult(true);
    setAccuracyPending(true);
    setAccuracyScore(null);
    setAccuracyQuality(null);
    try {
      const pendingMeasurement =
        accuracyPromiseRef.current ?? measurePrecision();
      accuracyPromiseRef.current = null;
      const { score, quality } = await pendingMeasurement;
      setAccuracyScore(score);
      setAccuracyQuality(quality);
    } catch (error) {
      console.error("Failed to measure WebGazer accuracy:", error);
      setAccuracyScore(null);
      setAccuracyQuality(null);
    } finally {
      setAccuracyPending(false);
    }
  };

  const handleFinishCalibration = () => {
    setShowCalibrationResult(false);
    setHasCalibrated(true);
    finishWebGazerCalibration();
    toggleKalmanFilter(true);
    disableTraining();
  };

  const handleRecalibrate = () => {
    accuracyPromiseRef.current = null;
    restartCalibration();
    enableTraining();
    setShowCalibrationResult(false);
    setShowCalibrationStep3(false);
    setShowCalibrationStep2(false);
    setShowCalibrationStep1(true);
    setHasCalibrated(false);
    setAccuracyScore(null);
    setAccuracyQuality(null);
    setAccuracyPending(false);
    toggleKalmanFilter(true);
  };

  // Runs when user cancels calibration or denies camera
  const handleCancelCalibration = () => {
    accuracyPromiseRef.current = null;
    restartCalibration();
    disableTraining();
    // Hide popup
    setShowCalibrationStep1(false);
    // Mark calibration as NOT done
    setHasCalibrated(false);
    // Turn off Iris
    setIrisEnabled(false);
    setAccuracyScore(null);
    setAccuracyQuality(null);
    setAccuracyPending(false);
  };

  useEffect(() => {
    if (!irisEnabled) {
      stopTracking();
      shutdown();
    }
  }, [irisEnabled, stopTracking, shutdown]);

  useEffect(() => {
    if (!irisEnabled || !hasCalibrated) return undefined;

    let cancelled = false;

    (async () => {
      try {
        // await new Promise(resolve => setTimeout(resolve, 400));
        if (cancelled) return;
        await startTracking();
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to start WebGazer tracking:", error);
        }
      }
    })();

    return () => {
      cancelled = true;
      stopTracking();
    };
  }, [irisEnabled, hasCalibrated, startTracking, stopTracking]);

  // Value shared to all components using IrisContext
  const value = useMemo(
    () => ({
      irisEnabled,
      setIrisEnabled,
      hasCalibrated,
    }),
    [irisEnabled, setIrisEnabled, hasCalibrated]
  );

  return (
    // Provide all Iris state + actions to the entire app
    <IrisContext.Provider value={value}>
      {children}

      {/* If user turns Iris ON and hasn't calibrated yet, show calibration step 1 */}
      {showCalibrationStep1 && (
        <CalibrationStep1
          onAllow={handleAllowCamera} // user accepts, start calibration
          onStart={handleBeginCalibration}
          onCancel={handleCancelCalibration} // user cancels, turn Iris OFF
        />
      )}
      {showCalibrationStep2 && (
        <CalibrationStep2 onComplete={handleCompleteDots} />
      )}
      {showCalibrationStep3 && (
        <CalibrationStep3
          onComplete={handleFocusComplete}
          onCountdownStart={handleCountdownBegin}
        />
      )}
      {showCalibrationResult && (
        <CalibrationStep4Result
          score={accuracyScore}
          quality={accuracyQuality}
          pending={accuracyPending}
          onRecalibrate={handleRecalibrate}
          onContinue={handleFinishCalibration}
        />
      )}
    </IrisContext.Provider>
  );
}

export function useIrisContext() {
  const ctx = useContext(IrisContext);

  if (!ctx) {
    throw new Error("useIrisContext must be used within an IrisManager");
  }
  return ctx;
}
