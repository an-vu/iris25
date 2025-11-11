// src/components/ReaderContainer.jsx
import { useRef, useCallback } from "react";
import ReaderView from "./ReaderView.jsx";
import GazeControls from "./GazeControls.jsx";
import "../styles/ReaderContainer.css";

const SCROLL_STEP = 200;

export default function ReaderContainer({ filePath, zoomPluginInstance }) {
  const scrollContainerRef = useRef(null);

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
      />
    </div>
  );
}
