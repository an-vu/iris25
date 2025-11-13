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
  const [status, setStatus] = useState(Status.idle);
  const [error, setError] = useState(null);
  const scriptRef = useRef(null);
  const hasConfiguredRef = useRef(false);
  const hasListenerRef = useRef(false);
  const pendingScriptPromiseRef = useRef(null);

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
    hasConfiguredRef.current = true;
  }, []);

  const attachListener = useCallback(() => {
    if (typeof window === "undefined" || !window.webgazer || hasListenerRef.current) return;
    window.webgazer.setGazeListener((data) => {
      if (!data) return;
      setGaze((prev) => ({
        x: prev.x == null ? data.x : prev.x * 0.8 + data.x * 0.2,
        y: prev.y == null ? data.y : prev.y * 0.8 + data.y * 0.2,
      }));
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
  }, []);

  const saveDataAcrossSessions = useCallback((value) => {
    window.webgazer?.saveDataAcrossSessions?.(value);
  }, []);

  useEffect(() => stop, [stop]);

  return {
    gaze,
    status,
    error,
    start,
    stop,
    pause,
    resume,
    clearData,
    saveDataAcrossSessions,
  };
}

export { Status as EyeTrackingEngineStatus };
