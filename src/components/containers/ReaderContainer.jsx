// src/components/containers/ReaderContainer.jsx
import { useRef, useCallback } from "react";
import ReaderView from "./ReaderView.jsx";
import GazeControls from "../buttons/GazeControls.jsx";
import { useIrisContext } from "../../iris/IrisManager.jsx";
import { useReaderGazeZones } from "../../iris/hooks/useReaderGazeZones.js";
import { useReaderGazeActions } from "../../iris/hooks/useReaderGazeActions.js";

// Tunable knobs for easing/scrolling behavior.
const SCROLL_STEP = 200;

export default function ReaderContainer({
  filePath,
  zoomPluginInstance,
  renderOverlay,
  renderControls,
}) {
  const scrollContainerRef = useRef(null);
  const buttonRefs = {
    up: useRef(null),
    down: useRef(null),
  };
  const { irisEnabled, hasCalibrated } = useIrisContext();

  const scrollViewer = useCallback((offset) => {
    const host = scrollContainerRef.current;
    if (!host) return;
    const target =
      host.querySelector(".rpv-core__inner-pages") ||
      host.querySelector(".rpv-core__pages") ||
      host;
    if (!target) return;
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

  const handleScrollUp = useCallback(() => {
    scrollViewer(-SCROLL_STEP);
  }, [scrollViewer]);

  const handleScrollDown = useCallback(() => {
    scrollViewer(SCROLL_STEP);
  }, [scrollViewer]);

  // Gaze zones (top/bottom)
  const { isTop, isBottom, zone } = useReaderGazeZones({
    enabled: irisEnabled && hasCalibrated,
    dwellMs: 450,
    // position zones in the top-right and bottom-right; ratios handled via overlay CSS
    topRatio: 0.25,
    bottomRatio: 0.75,
    deadZoneRatio: 0,
  });

  // Gaze-driven scroll actions with repeat
  useReaderGazeActions({
    zone,
    onScrollUp: handleScrollUp,
    onScrollDown: handleScrollDown,
    dwellDelayMs: 0,
    repeatDelayMs: 1000,
    repeatIntervalMs: 700,
  });

  const controls =
    typeof renderControls === "function"
      ? renderControls({
          onScrollUp: handleScrollUp,
          onScrollDown: handleScrollDown,
          isTop,
          isBottom,
          upRef: buttonRefs.up,
          downRef: buttonRefs.down,
        })
      : (
        <GazeControls
          onScrollUp={handleScrollUp}
          onScrollDown={handleScrollDown}
          upRef={buttonRefs.up}
          downRef={buttonRefs.down}
          isTopActive={isTop}
          isBottomActive={isBottom}
        />
      );

  return (
    <>
      {typeof renderOverlay === "function" ? renderOverlay({ isTop, isBottom }) : null}
      <div className="reader-container">
        {/* Reader View */}
        <ReaderView
          filePath={filePath}
          zoomPluginInstance={zoomPluginInstance}
          scrollContainerRef={scrollContainerRef}
        />
      </div>
      {controls}
    </>
  );
}
