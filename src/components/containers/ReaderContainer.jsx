// src/components/containers/ReaderContainer.jsx
import { useRef, useCallback } from "react";
import ReaderView from "./ReaderView.jsx";
import GazeControls from "../buttons/GazeControls.jsx";

// Tunable knobs for easing/scrolling behavior.
const SCROLL_STEP = 200;

export default function ReaderContainer({ filePath, zoomPluginInstance }) {
  const scrollContainerRef = useRef(null);
  const buttonRefs = {
    up: useRef(null),
    down: useRef(null),
  };

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
        onScrollUp={handleScrollUp}
        onScrollDown={handleScrollDown}
        upRef={buttonRefs.up}
        downRef={buttonRefs.down}
      />
    </div>
  );
}
