// src/components/ReaderContainer.jsx
import { useRef, useCallback, useEffect, useState } from "react";
import ReaderView from "./ReaderView.jsx";
import GazeControls from "./GazeControls.jsx";
import "../styles/ReaderContainer.css";
import { useCalibration } from "../contexts/CalibrationContext.jsx";

// Tunable knobs for easing/scrolling behavior.
const SCROLL_STEP = 200;
const GAZE_DEBOUNCE_MS = 500;
const GAZE_PROXIMITY = 80;

export default function ReaderContainer({ filePath, zoomPluginInstance }) {
  const scrollContainerRef = useRef(null);
  const {
    eyeTrackingEnabled,
    hasAcceptedCamera,
    gaze,
    error,
    isCalibrating,
  } = useCalibration();
  const buttonRefs = {
    up: useRef(null),
    down: useRef(null),
  };
  const [buttonRects, setButtonRects] = useState({ up: null, down: null });
  const [isGazeScrolling, setIsGazeScrolling] = useState({ up: false, down: false });
  const gazeTimeoutRef = useRef({ up: null, down: null });

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
    if (
      !eyeTrackingEnabled ||
      !hasAcceptedCamera ||
      !gaze ||
      gaze.x == null ||
      gaze.y == null ||
      isCalibrating
    )
      return;
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
  }, [eyeTrackingEnabled, hasAcceptedCamera, gaze, buttonRects, isGazeScrolling, scrollViewer, isCalibrating]);

  // Cleanup: make sure timers are cleared if the component unmounts.
  useEffect(() => {
    return () => {
      clearTimeout(gazeTimeoutRef.current.up);
      clearTimeout(gazeTimeoutRef.current.down);
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
    </div>
  );
}
