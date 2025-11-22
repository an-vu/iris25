import { useEffect, useRef, useState } from "react";
import { addGazeListener } from "../webgazerManager.js";
import { startReaderGazeZones } from "../zones/readerGazeZones.js";

/**
 * Reader-page hook to convert gaze into vertical zones (top/bottom).
 */
export function useReaderGazeZones({
  enabled = true,
  topRatio = 0.25,
  bottomRatio = 0.75,
  dwellMs = 450,
  deadZoneRatio = 0,
} = {}) {
  const [zone, setZone] = useState(null);
  const enabledRef = useRef(enabled);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setZone(null);
      return undefined;
    }

    const dispose = startReaderGazeZones(
      addGazeListener,
      { onZoneChange: setZone },
      { topRatio, bottomRatio, dwellMs, deadZoneRatio },
    );

    return () => dispose && dispose();
  }, [enabled, topRatio, bottomRatio, dwellMs, deadZoneRatio]);

  return {
    zone,
    isTop: zone === "top",
    isBottom: zone === "bottom",
  };
}
