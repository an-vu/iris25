const noop = () => {};

/**
 * Vertical gaze zones for the reader page (top/bottom).
 * Uses dwell to reduce jitter and supports an optional center dead-zone via deadZoneRatio.
 */
export function startReaderGazeZones(
  subscribeToGaze,
  {
    onZoneChange = noop,
    onEnter = noop,
    onExit = noop,
  } = {},
  {
    topRatio = 0.16,
    bottomRatio = 0.84,
    dwellMs = 450,
    deadZoneRatio = 0, // e.g., 0.1 leaves 10% neutral band in middle
  } = {},
) {
  if (typeof subscribeToGaze !== "function") {
    throw new Error("startReaderGazeZones requires a subscribeToGaze function");
  }

  let currentZone = null;
  let pendingZone = null;
  let dwellTimer = null;
  let viewportHeight = window.innerHeight;

  const recomputeViewport = () => {
    viewportHeight = window.innerHeight;
  };

  const clearPending = () => {
    if (dwellTimer) {
      clearTimeout(dwellTimer);
      dwellTimer = null;
    }
    pendingZone = null;
  };

  const resolveZone = (y) => {
    if (typeof y !== "number" || Number.isNaN(y) || viewportHeight <= 0) {
      return null;
    }

    const topEdge = viewportHeight * topRatio;
    const bottomEdge = viewportHeight * bottomRatio;

    // Optional dead zone around center (no zone if gaze is within this band)
    // MIGHT NOT BE NECCESSARY CAN BE DELETED DURING CLEANUP
    if (deadZoneRatio > 0) {
      const centerBand = viewportHeight * deadZoneRatio;
      const centerTop = (viewportHeight - centerBand) / 2;
      const centerBottom = centerTop + centerBand;
      if (y >= centerTop && y <= centerBottom) return null;
    }

    if (y <= topEdge) return "top";
    if (y >= bottomEdge) return "bottom";
    return null;
  };

  const handleGaze = (data = {}) => {
    const zone = resolveZone(data.y);
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
        if (prev && prev !== currentZone) onExit(prev, currentZone);
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
