import { useCallback, useEffect, useRef, useState } from "react";
import { zoomPlugin } from "@react-pdf-viewer/zoom";

const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4, 5];
const MIN_ZOOM = ZOOM_LEVELS[0];
const MAX_ZOOM = ZOOM_LEVELS[ZOOM_LEVELS.length - 1];
const ZOOM_ANIMATION_DURATION = 220;
const FALLBACK_STEP = 0.25;

export function useZoomControls() {
  const zoomPluginInstance = zoomPlugin();
  const [currentScale, setCurrentScale] = useState(1);
  const scaleRef = useRef(1);
  const animationFrameRef = useRef(null);

  const handleScaleChange = useCallback((scale) => {
    scaleRef.current = scale;
    setCurrentScale(scale);
  }, []);

  const cancelZoomAnimation = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  useEffect(() => cancelZoomAnimation, [cancelZoomAnimation]);

  const animateZoomTo = useCallback(
    (targetScale) => {
      const zoomTo = zoomPluginInstance?.zoomTo;
      if (!zoomTo) return;
      const startScale = scaleRef.current;
      if (Math.abs(targetScale - startScale) < 0.001) return;

      cancelZoomAnimation();
      let startTime;

      const step = (timestamp) => {
        if (startTime === undefined) startTime = timestamp;
        const progress = Math.min(
          (timestamp - startTime) / ZOOM_ANIMATION_DURATION,
          1
        );
        const eased = easeOutCubic(progress);
        const nextScale = startScale + (targetScale - startScale) * eased;
        zoomTo(nextScale);

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(step);
        } else {
          animationFrameRef.current = null;
        }
      };

      animationFrameRef.current = requestAnimationFrame(step);
    },
    [zoomPluginInstance, cancelZoomAnimation]
  );

  const handleZoomIn = useCallback(() => {
    const nextScale = getNextScale(scaleRef.current);
    animateZoomTo(nextScale);
  }, [animateZoomTo]);

  const handleZoomOut = useCallback(() => {
    const previousScale = getPreviousScale(scaleRef.current);
    animateZoomTo(previousScale);
  }, [animateZoomTo]);

  const disableZoomIn = currentScale >= MAX_ZOOM - 0.001;
  const disableZoomOut = currentScale <= MIN_ZOOM + 0.001;

  return {
    zoomPluginInstance,
    handleZoomIn,
    handleZoomOut,
    disableZoomIn,
    disableZoomOut,
    handleScaleChange,
  };
}

function getNextScale(scale) {
  const nextPreset = ZOOM_LEVELS.find((level) => level > scale + 0.001);
  if (nextPreset) return nextPreset;
  return Math.min(MAX_ZOOM, +(scale + FALLBACK_STEP).toFixed(2));
}

function getPreviousScale(scale) {
  for (let i = ZOOM_LEVELS.length - 1; i >= 0; i -= 1) {
    if (ZOOM_LEVELS[i] < scale - 0.001) return ZOOM_LEVELS[i];
  }
  return Math.max(MIN_ZOOM, +(scale - FALLBACK_STEP).toFixed(2));
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}
