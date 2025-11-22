import { useCallback, useEffect, useRef } from "react";

const noop = () => {};
const HOLD_INTERVAL_MS = 150; // ms between repeat scroll actions while holding

// Provides press-and-hold behavior for a callback by looping `handler`
// until the pointer/touch interaction ends.
function useHold(handler) {
  const intervalRef = useRef(null);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(
    (event) => {
      if (event) event.preventDefault();
      handler(); // fire immediately so the first scroll feels responsive
      stop();
      intervalRef.current = setInterval(() => {
        handler();
      }, HOLD_INTERVAL_MS);
    },
    [handler, stop]
  );

  useEffect(() => stop, [stop]);
  return { start, stop };
}

// Renders the two gaze buttons and wires them to either mouse/touch
// presses or the gaze-to-ref logic supplied via ReaderContainer.
export default function GazeControls({
  onScrollUp = noop,
  onScrollDown = noop,
  upRef,
  downRef,
  isTopActive = false,
  isBottomActive = false,
}) {
  const upHold = useHold(onScrollUp);
  const downHold = useHold(onScrollDown);

  const buildHandlers = (holdControls, handler) => ({
    onMouseDown: holdControls.start,
    onMouseUp: holdControls.stop,
    onMouseLeave: holdControls.stop,
    onTouchStart: holdControls.start,
    onTouchEnd: holdControls.stop,
    onTouchCancel: holdControls.stop,
    onKeyDown: (event) => {
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        handler();
      }
    },
  });

  return (
    <div className="gaze-controls">
      {/* Scroll Up */}
      <button
        className={`gaze-button up${isTopActive ? " gaze-active" : ""}`}
        title="Scroll Up"
        type="button"
        ref={upRef}
        {...buildHandlers(upHold, onScrollUp)}
      >
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
          <path
            d="M16 12L12 8L8 12M12 8V16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Scroll Down */}
      <button
        className={`gaze-button down${isBottomActive ? " gaze-active" : ""}`}
        title="Scroll Down"
        type="button"
        ref={downRef}
        {...buildHandlers(downHold, onScrollDown)}
      >
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
          <path
            d="M8 12L12 16L16 12M12 16V8M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
