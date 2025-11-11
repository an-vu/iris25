// src/components/ReaderContainer.jsx
import { useRef, useCallback, useEffect, useState } from "react";
import useWebGazer from "../hooks/useWebGazer";
import ReaderView from "./ReaderView.jsx";
import GazeControls from "./GazeControls.jsx";
import CalibrationOverlay from "./CalibrationOverlay.jsx";
import "../styles/ReaderContainer.css";
import {
  showWebgazerVideo,
  hideWebgazerVideo,
  restoreWebgazerVideo,
  CALIBRATION_POSITIONS,
  POSITION_STYLES,
} from "../utils/webgazerCalibrate";

// Tunable knobs for easing/scrolling behavior.
const SCROLL_STEP = 200;
const GAZE_DEBOUNCE_MS = 500;
const GAZE_PROXIMITY = 80;
const CAL_STEP_DURATION = 10000; // ms per calibration waypoint

export default function ReaderContainer({ filePath, zoomPluginInstance }) {
  const scrollContainerRef = useRef(null);
  const { gaze, isReady, error } = useWebGazer();
  const buttonRefs = {
    up: useRef(null),
    down: useRef(null),
  };
  const [buttonRects, setButtonRects] = useState({ up: null, down: null });
  const [isGazeScrolling, setIsGazeScrolling] = useState({ up: false, down: false });
  const gazeTimeoutRef = useRef({ up: null, down: null });
  const hasCalibratedRef = useRef(false); // ensures calibration modal runs once per session
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationStep, setCalibrationStep] = useState(-1);
  const [calibrationCountdown, setCalibrationCountdown] = useState(0);
  const videoMountRef = useRef(null);
  const currentCalibrationPoint =
    calibrationStep >= 0 && calibrationStep < CALIBRATION_POSITIONS.length
      ? CALIBRATION_POSITIONS[calibrationStep]
      : null;

  // Core scrolling helper shared by gaze buttons and eye tracking.
  const scrollViewer = useCallback((offset) => {
    const host = scrollContainerRef.current;
    if (!host) {
      console.warn("GazeControls: no scroll container yet");
      return;
    }
    const target =
      host.querySelector(".rpv-core__inner-pages") ||
      host.querySelector(".rpv-core__pages") ||
      host;
    if (!target) {
      console.warn("GazeControls: no scrollable target found");
      return;
    }
    const wheelSupported = typeof WheelEvent === "function";
    if (wheelSupported) {
      const evt = new WheelEvent("wheel", {
        deltaY: offset,
        bubbles: true,
        cancelable: true,
      });
      target.dispatchEvent(evt);
      return;
    }
    target.scrollBy({ top: offset, behavior: "smooth" });
  }, []);

  // Surface any WebGazer errors so we know why tracking failed.
  useEffect(() => {
    if (error) {
      console.error("[WebGazer] error detected:", error);
    }
  }, [error]);

  // Log when the tracker successfully enters the ready state.
  // Kick off the calibration overlay the first time WebGazer reports ready.
  useEffect(() => {
    if (!isReady || hasCalibratedRef.current) return;
    console.info("[WebGazer] gaze tracking active");
    setIsCalibrating(true);
    setCalibrationStep(0);
  }, [isReady]);

  // Drive each 10-second calibration waypoint (top-left, top-right, etc.).
  useEffect(() => {
    if (!isCalibrating || calibrationStep < 0) return;

    if (calibrationStep >= CALIBRATION_POSITIONS.length) {
      hideWebgazerVideo();
      restoreWebgazerVideo();
      hasCalibratedRef.current = true;
      setIsCalibrating(false);
      setCalibrationCountdown(0);
      return;
    }

    const currentPoint = CALIBRATION_POSITIONS[calibrationStep];
    showWebgazerVideo(currentPoint.id, videoMountRef.current);
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
    };
  }, [isCalibrating, calibrationStep]);

  // Cache the bounding boxes of each gaze button so gaze math stays cheap.
  useEffect(() => {
    const updateRects = () => {
      setButtonRects({
        up: buttonRefs.up.current?.getBoundingClientRect() || null,
        down: buttonRefs.down.current?.getBoundingClientRect() || null,
      });
    };
    updateRects();
    window?.addEventListener?.("resize", updateRects);
    return () => window?.removeEventListener?.("resize", updateRects);
  }, []);

  // When gaze data updates, decide whether we should scroll up or down.
  useEffect(() => {
    if (!gaze || gaze.x == null || gaze.y == null || isCalibrating) return;
    const { up, down } = buttonRects;
    const withinRect = (rect) =>
      rect &&
      gaze.x >= rect.left - GAZE_PROXIMITY &&
      gaze.x <= rect.right + GAZE_PROXIMITY &&
      gaze.y >= rect.top - GAZE_PROXIMITY &&
      gaze.y <= rect.bottom + GAZE_PROXIMITY;

    const nearUp = withinRect(up);
    const nearDown = withinRect(down);

    if (nearUp && !isGazeScrolling.up) {
      scrollViewer(-SCROLL_STEP / 2);
      setIsGazeScrolling((prev) => ({ ...prev, up: true }));
      clearTimeout(gazeTimeoutRef.current.up);
      gazeTimeoutRef.current.up = setTimeout(() => {
        setIsGazeScrolling((prev) => ({ ...prev, up: false }));
        gazeTimeoutRef.current.up = null;
      }, GAZE_DEBOUNCE_MS);
      return;
    }

    if (nearDown && !isGazeScrolling.down) {
      scrollViewer(SCROLL_STEP / 2);
      setIsGazeScrolling((prev) => ({ ...prev, down: true }));
      clearTimeout(gazeTimeoutRef.current.down);
      gazeTimeoutRef.current.down = setTimeout(() => {
        setIsGazeScrolling((prev) => ({ ...prev, down: false }));
        gazeTimeoutRef.current.down = null;
      }, GAZE_DEBOUNCE_MS);
      return;
    }

    if (!nearUp && isGazeScrolling.up) {
      setIsGazeScrolling((prev) => ({ ...prev, up: false }));
      clearTimeout(gazeTimeoutRef.current.up);
      gazeTimeoutRef.current.up = null;
    }

    if (!nearDown && isGazeScrolling.down) {
      setIsGazeScrolling((prev) => ({ ...prev, down: false }));
      clearTimeout(gazeTimeoutRef.current.down);
      gazeTimeoutRef.current.down = null;
    }
  }, [gaze, buttonRects, isGazeScrolling, scrollViewer]);

  // Cleanup: make sure timers are cleared if the component unmounts.
  useEffect(() => {
    return () => {
      clearTimeout(gazeTimeoutRef.current.up);
      clearTimeout(gazeTimeoutRef.current.down);
    };
  }, []);

  useEffect(() => {
    return () => {
      hideWebgazerVideo();
      restoreWebgazerVideo();
    };
  }, []);

  return (
    <div className="reader-container">
      {/* Reader View */}
      <ReaderView
        filePath={filePath}
        zoomPluginInstance={zoomPluginInstance}
        scrollContainerRef={scrollContainerRef}
      />
      {/* Gaze Controls */}
      <GazeControls
        onScrollUp={() => scrollViewer(-SCROLL_STEP)}
        onScrollDown={() => scrollViewer(SCROLL_STEP)}
        upRef={buttonRefs.up}
        downRef={buttonRefs.down}
      />
      {isCalibrating && calibrationStep >= 0 && (
        <CalibrationOverlay
          step={Math.min(calibrationStep, CALIBRATION_POSITIONS.length - 1)}
          totalSteps={CALIBRATION_POSITIONS.length}
          countdown={calibrationCountdown}
          message={
            currentCalibrationPoint?.label || "Hold steady for a moment"
          }
          positionStyle={
            currentCalibrationPoint
              ? POSITION_STYLES[currentCalibrationPoint.id]
              : undefined
          }
          videoRef={videoMountRef}
        />
      )}
    </div>
  );
}
