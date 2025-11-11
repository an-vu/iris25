import { useEffect, useRef, useState } from "react";

// Lazy-load WebGazer from a CDN so end users only download it when needed.
const WEBGAZER_CDN = "https://cdn.jsdelivr.net/npm/webgazer/dist/webgazer.min.js";

export default function useWebGazer(enabled = true) {
  const [gaze, setGaze] = useState({ x: null, y: null });
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const hasStartedRef = useRef(false);
  const scriptRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    if (!enabled) {
      setIsReady(false);
      setGaze({ x: null, y: null });
      return () => {
        isMounted = false;
      };
    }

    // Inject the WebGazer script at runtime so the rest of the app stays lightweight.
    const attachScript = () =>
      new Promise((resolve, reject) => {
        if (scriptRef.current) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = WEBGAZER_CDN;
        script.async = true;
        script.onload = () => {
          scriptRef.current = script;
          resolve();
        };
        script.onerror = (event) => reject(new Error("Failed to load WebGazer script"));
        document.body.appendChild(script);
      });

    // Boot WebGazer once and stream gaze coordinates back into React state.
    const startWebGazer = async () => {
      if (typeof window === "undefined") return;

      try {
        if (!window.webgazer) {
          await attachScript();
        }

        if (!window.webgazer || hasStartedRef.current || !isMounted) {
          return;
        }

        hasStartedRef.current = true;

        window.webgazer
          .setRegression("ridge")
          .setTracker("clmtrackr")
          .setGazeListener((data) => {
            if (data && isMounted) {
              // Smooth raw gaze data so the red dot and scroll triggers jitter less.
              setGaze((prev) => ({
                x: prev.x == null ? data.x : prev.x * 0.8 + data.x * 0.2,
                y: prev.y == null ? data.y : prev.y * 0.8 + data.y * 0.2,
              }));
            }
          });

        // Debug overlays are toggled on/off by the calibration helper so leave them as-is here.

        console.info("[WebGazer] Initializing...");
        await window.webgazer.begin();
        if (!isMounted) return;
        setIsReady(true);
        console.info("[WebGazer] Ready");
      } catch (err) {
        console.error("[WebGazer] Failed to start", err);
        if (isMounted) setError(err);
      }
    };

    startWebGazer();

    return () => {
      isMounted = false;
      if (window?.webgazer) {
        window.webgazer.clearGazeListener?.();
        window.webgazer.end();
      }
      hasStartedRef.current = false;
      if (scriptRef.current) {
        scriptRef.current.remove();
        scriptRef.current = null;
      }
    };
  }, [enabled]);

  useEffect(() => {
    if (enabled || typeof window === "undefined" || !window.webgazer) return;
    window.webgazer.pause?.();
    window.webgazer.showVideo(false);
    window.webgazer.showFaceOverlay(false);
    window.webgazer.showFaceFeedbackBox?.(false);
    window.webgazer.showPredictionPoints(false);
  }, [enabled]);
  // The component only needs the latest coordinates plus simple lifecycle flags.
  return { gaze, isReady, error };
}
