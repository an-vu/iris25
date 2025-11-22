// Lightweight gaze-to-zone helper for the home page.
// Consumes a gaze subscription function (e.g., addGazeListener from webgazerManager)
// and emits zone changes after a small dwell to reduce jitter.

const noop = () => {};

/**
 * Start tracking gaze zones on the home page.
 *
 * @param {Function} subscribeToGaze - Function that accepts a listener and returns an unsubscribe.
 * @param {Object} callbacks
 * @param {Function} callbacks.onZoneChange - Called after dwell when zone switches: (zone) => void
 * @param {Function} callbacks.onEnter - Optional, fires with both previous and next zone: (nextZone, prevZone) => void
 * @param {Function} callbacks.onExit - Optional, fires when leaving a zone: (prevZone, nextZone) => void
 * @param {Object} options
 * @param {number} options.leftRatio - Portion of width for left zone (0–1).
 * @param {number} options.rightRatio - Portion of width for right zone start (0–1).
 * @param {number} options.dwellMs - Time the gaze must stay in a new zone before switching.
 */
export function startHomeGazeZones(
  subscribeToGaze,
  {
    onZoneChange = noop,
    onEnter = noop,
    onExit = noop,
  } = {},
  {
    leftRatio = 0.1,
    rightRatio = 0.9,
    dwellMs = 450,
    getCenterRect = null,
  } = {},
) {
  if (typeof subscribeToGaze !== "function") {
    throw new Error("startHomeGazeZones requires a subscribeToGaze function");
  }

  let currentZone = null;
  let pendingZone = null;
  let dwellTimer = null;
  let viewportWidth = window.innerWidth;
  let viewportHeight = window.innerHeight;

  const recomputeViewport = () => {
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;
  };

  const clearPending = () => {
    if (dwellTimer) {
      clearTimeout(dwellTimer);
      dwellTimer = null;
    }
    pendingZone = null;
  };

  const resolveZone = (x, y) => {
    if (typeof x !== "number" || Number.isNaN(x) || viewportWidth <= 0) {
      return null;
    }

    const hasY = typeof y === "number" && !Number.isNaN(y);

    // Prefer explicit center rect (e.g., read button bounds) if provided
    if (typeof getCenterRect === "function") {
      const rect = getCenterRect();
      if (
        rect &&
        typeof rect.left === "number" &&
        typeof rect.right === "number" &&
        typeof rect.top === "number" &&
        typeof rect.bottom === "number"
      ) {
        const insideRect =
          x >= rect.left &&
          x <= rect.right &&
          hasY &&
          viewportHeight > 0 &&
          y >= rect.top &&
          y <= rect.bottom;

        if (insideRect) return "center";

        // If center rect exists and gaze is not inside it, avoid treating mid-band as center
        const leftEdge = viewportWidth * leftRatio;
        const rightEdge = viewportWidth * rightRatio;
        if (x <= leftEdge) return "left";
        if (x >= rightEdge) return "right";
        return null;
      } else {
        // If center rect is expected but missing, avoid defaulting to center
        return null;
      }
    }

    const leftEdge = viewportWidth * leftRatio;
    const rightEdge = viewportWidth * rightRatio;
    if (x <= leftEdge) return "left";
    if (x >= rightEdge) return "right";
    return "center";
  };

  const handleGaze = (data = {}) => {
    const zone = resolveZone(data.x, data.y);
    if (!zone) return;

    if (zone === currentZone) {
      clearPending();
      return;
    }

    if (zone !== pendingZone) {
      clearPending();
      pendingZone = zone;
      dwellTimer = setTimeout(() => {
        const prev = currentZone;
        currentZone = pendingZone;
        pendingZone = null;
        dwellTimer = null;
        if (prev && prev !== currentZone) {
          onExit(prev, currentZone);
        }
        onEnter(currentZone, prev);
        onZoneChange(currentZone);
      }, dwellMs);
    }
  };

  const unsubscribe = subscribeToGaze(handleGaze) || noop;
  window.addEventListener("resize", recomputeViewport);

  return () => {
    clearPending();
    unsubscribe();
    window.removeEventListener("resize", recomputeViewport);
  };
}
