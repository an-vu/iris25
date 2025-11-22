import { useEffect, useRef, useState } from "react";
import { addGazeListener } from "../webgazerManager.js";
import { startHomeGazeZones } from "../zones/homeGazeZones.js";

/**
 * Home-page hook to convert gaze into left/center/right zones.
 * Pass an optional centerRect (e.g., the read button bounds) for precise center hit-testing.
 */
export function useHomeGazeZones({
  enabled = true,
  centerRect = null,
  leftRatio = 0.1,
  rightRatio = 0.9,
  dwellMs = 450,
} = {}) {
  const [zone, setZone] = useState(null);
  const centerRectRef = useRef(centerRect);

  useEffect(() => {
    centerRectRef.current = centerRect;
  }, [centerRect]);

  useEffect(() => {
    if (!enabled) {
      setZone(null);
      return undefined;
    }

    const dispose = startHomeGazeZones(
      addGazeListener,
      { onZoneChange: setZone },
      {
        leftRatio,
        rightRatio,
        dwellMs,
        getCenterRect: () => centerRectRef.current,
      },
    );

    return () => dispose && dispose();
  }, [enabled, leftRatio, rightRatio, dwellMs]);

  return {
    zone,
    isLeft: zone === "left",
    isCenter: zone === "center",
    isRight: zone === "right",
  };
}
