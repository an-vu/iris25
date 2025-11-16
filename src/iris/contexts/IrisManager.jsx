// IrisManager handles everything that happens when Iris is turned ON or OFF.
//
// - When the user turns Iris ON:
//      - check if they’ve calibrated before
//      - if not, show the calibration calibration popup
//
// - When the user turns Iris OFF:
//      - hide any Iris UI
//      - reset calibration state
//
// This file also provides Iris state (enabled, calibrated, reset functions) to the rest of the app
// through React Context, so any component can know if Iris is active.

// React tools to create context and manage state
import { createContext, useContext, useEffect, useMemo, useState } from "react";

// Hook that reads/updates the Iris ON/OFF toggle (stored in localStorage or state)
import { useIrisToggle } from "../../hooks/useIrisToggle.js";

// First calibration UI popup component
import CalibrationStep1 from "../../components/calibration/CalibrationStep1.jsx";
import CalibrationStep2 from "../../components/calibration/CalibrationStep2.jsx";
import CalibrationStep3 from "../../components/calibration/CalibrationStep3.jsx";


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
    }
  }, [irisEnabled, hasCalibrated]); // Dependencies: run when these change

  // Runs when user clicks "Allow camera"
  const handleAllowCamera = () => {
    // Placeholder for future WebGazer start logic.
  };

  const handleBeginCalibration = () => {
    setShowCalibrationStep1(false);
    setShowCalibrationStep2(true);
  };

  const handleCompleteDots = () => {
    setShowCalibrationStep2(false);
    setShowCalibrationStep3(true);
  };

  const handleFocusComplete = () => {
    setShowCalibrationStep3(false);
    setHasCalibrated(true);
  };

  // Runs when user cancels calibration or denies camera
  const handleCancelCalibration = () => {
    // Hide popup
    setShowCalibrationStep1(false);
    // Mark calibration as NOT done
    setHasCalibrated(false);
    // Turn off Iris
    setIrisEnabled(false);
  };

  // Value shared to all components using IrisContext
  const value = useMemo(
    () => ({
      irisEnabled, // is Iris ON or OFF
      setIrisEnabled, // function to turn it ON/OFF
      hasCalibrated, // whether calibration is finished
      resetCalibration: () => {
        // manually reset calibration state anywhere
        setHasCalibrated(false);
        setShowCalibrationStep1(false);
        setShowCalibrationStep2(false);
        setShowCalibrationStep3(false);
      },
    }),
    [irisEnabled, setIrisEnabled, hasCalibrated] // recompute when these change
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
        <CalibrationStep3 onComplete={handleFocusComplete} />
      )}
    </IrisContext.Provider>
  );
}

// Hook to use Iris state anywhere in the app
export function useIrisContext() {
  const ctx = useContext(IrisContext);

  // Defensive check: must be inside <IrisProvider>
  if (!ctx) {
    throw new Error("useIrisContext must be used within an IrisManager");
  }
  return ctx;
}
