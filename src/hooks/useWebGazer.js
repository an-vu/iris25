import { useCallback, useEffect, useRef, useState } from "react";

const WEBGAZER_CDN = "https://cdn.jsdelivr.net/npm/webgazer/dist/webgazer.min.js";

const Status = {
  idle: "idle",
  loading: "loading",
  initializing: "initializing",
  running: "running",
  paused: "paused",
  error: "error",
};

export default function useWebGazerEngine() {
  const [gaze, setGaze] = useState({ x: null, y: null });
  const [rawGaze, setRawGaze] = useState({ x: null, y: null });
  const [status, setStatus] = useState(Status.idle);
  const [error, setError] = useState(null);
  const [hasInitialSample, setHasInitialSample] = useState(false);
  const scriptRef = useRef(null);
  const hasConfiguredRef = useRef(false);
  const hasListenerRef = useRef(false);
  const pendingScriptPromiseRef = useRef(null);
  const smoothingRef = useRef({ x: null, y: null });
  const needsReseedRef = useRef(true);
  const hasInitialSampleRef = useRef(false);

  const ensureScript = useCallback(() => {
    if (typeof window === "undefined") return Promise.reject(new Error("No window"));
    if (scriptRef.current) return Promise.resolve();
    if (pendingScriptPromiseRef.current) return pendingScriptPromiseRef.current;

    setStatus(Status.loading);
    pendingScriptPromiseRef.current = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = WEBGAZER_CDN;
      script.async = true;
      script.onload = () => {
        scriptRef.current = script;
        pendingScriptPromiseRef.current = null;
        resolve();
      };
      script.onerror = () => {
        pendingScriptPromiseRef.current = null;
        reject(new Error("Failed to load WebGazer script"));
      };
      document.body.appendChild(script);
    });
    return pendingScriptPromiseRef.current;
  }, []);

  const configureWebGazer = useCallback(() => {
    if (typeof window === "undefined" || !window.webgazer || hasConfiguredRef.current) return;
    window.webgazer
      .setRegression("weightedRidge")
      .setTracker("TFFacemesh")
      .applyKalmanFilter(true)
      .saveDataAcrossSessions(false);

    const params = window.webgazer.params || {};
    params.videoViewerWidth = params.videoViewerWidth ?? 320;
    params.videoViewerHeight = params.videoViewerHeight ?? 240;
    params.showPredictionPoints = true;
    if (params.faceFeedbackBox) {
      params.faceFeedbackBox.lineWidth = 0;
      params.faceFeedbackBox.strokeStyle = "rgba(255,255,255,0)";
    }

    hasConfiguredRef.current = true;
  }, []);

  const attachListener = useCallback(() => {
    if (typeof window === "undefined" || !window.webgazer || hasListenerRef.current) return;
    window.webgazer.setGazeListener((data) => {
      if (!data) return;
      const bounded = window.webgazer?.util?.bound?.(data) || data;
      setRawGaze(bounded);
      if (!hasInitialSampleRef.current) {
        hasInitialSampleRef.current = true;
        setHasInitialSample(true);
      }

      const prev = smoothingRef.current;
      const jumpThreshold = 180;
      const needsReseed = needsReseedRef.current || prev.x == null || prev.y == null;
      const dx = prev.x == null ? 0 : Math.abs(bounded.x - prev.x);
      const dy = prev.y == null ? 0 : Math.abs(bounded.y - prev.y);

      if (needsReseed || dx > jumpThreshold || dy > jumpThreshold) {
        smoothingRef.current = { x: bounded.x, y: bounded.y };
        needsReseedRef.current = false;
        setGaze({ x: bounded.x, y: bounded.y });
        return;
      }

      const smoothX = prev.x * 0.7 + bounded.x * 0.3;
      const smoothY = prev.y * 0.7 + bounded.y * 0.3;
      smoothingRef.current = { x: smoothX, y: smoothY };
      setGaze({ x: smoothX, y: smoothY });
    });
    hasListenerRef.current = true;
  }, []);

  const detachListener = useCallback(() => {
    if (!window?.webgazer || !hasListenerRef.current) return;
    window.webgazer.clearGazeListener?.();
    hasListenerRef.current = false;
  }, []);

  const start = useCallback(async () => {
    try {
      if (status === Status.running || status === Status.initializing) return;
      await ensureScript();
      configureWebGazer();
      attachListener();
      setStatus(Status.initializing);
      await window.webgazer.begin();
      setStatus(Status.running);
    } catch (err) {
      console.error("[WebGazer] Failed to start", err);
      setError(err);
      setStatus(Status.error);
    }
  }, [attachListener, configureWebGazer, ensureScript, status]);

  const stop = useCallback(() => {
    if (!window?.webgazer) return;
    window.webgazer.end();
    detachListener();
    setStatus(Status.idle);
    hasConfiguredRef.current = false;
    hasInitialSampleRef.current = false;
    setHasInitialSample(false);
    smoothingRef.current = { x: null, y: null };
    needsReseedRef.current = true;
    setGaze({ x: null, y: null });
    setRawGaze({ x: null, y: null });
  }, [detachListener]);

  const pause = useCallback(() => {
    window.webgazer?.pause?.();
    setStatus((prev) => (prev === Status.running ? Status.paused : prev));
  }, []);

  const resume = useCallback(() => {
    window.webgazer?.resume?.();
    setStatus((prev) => (prev === Status.paused ? Status.running : prev));
  }, []);

  const clearData = useCallback(() => {
    window.webgazer?.clearData?.();
    smoothingRef.current = { x: null, y: null };
    needsReseedRef.current = true;
    setGaze({ x: null, y: null });
  }, []);

  const resetSmoothing = useCallback(() => {
    smoothingRef.current = { x: null, y: null };
    needsReseedRef.current = true;
    setGaze({ x: null, y: null });
  }, []);

  const saveDataAcrossSessions = useCallback((value) => {
    window.webgazer?.saveDataAcrossSessions?.(value);
  }, []);

  useEffect(() => stop, [stop]);

  return {
    gaze,
    rawGaze,
    status,
    error,
    hasInitialSample,
    start,
    stop,
    pause,
    resume,
    clearData,
    resetSmoothing,
    saveDataAcrossSessions,
  };
}

export { Status as EyeTrackingEngineStatus };
