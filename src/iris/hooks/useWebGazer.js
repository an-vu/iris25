import { useCallback, useEffect, useRef, useState } from "react";
import {
  initWebgazer,
  shutdown as shutdownManager,
  pause as pauseManager,
  resume as resumeManager,
  recordScreenPosition,
  clearTrainingData,
  setGazeListener,
  clearGazeListener,
  getCurrentPrediction,
  distanceToTarget,
} from "../webgazerManager.js";

const noop = () => {};

/**
 * React hook that provides a high-level interface to WebGazer.
 * UI code can call the returned functions without touching the WebGazer API.
 */
export function useWebGazer(options = {}) {
  const {
    autoInit = false,
    autoShutdown = true,
    onGaze = noop,
  } = options;

  const [status, setStatus] = useState("idle"); // idle | initializing | ready | error
  const [error, setError] = useState(null);
  const [latestGaze, setLatestGaze] = useState(null);
  const [isCalibrating, setIsCalibrating] = useState(false);

  const initPromiseRef = useRef(null);
  const gazeCallbackRef = useRef(onGaze);
  const listenerActiveRef = useRef(false);

  useEffect(() => {
    gazeCallbackRef.current = onGaze || noop;
  }, [onGaze]);

  const initialize = useCallback(async () => {
    if (initPromiseRef.current) return initPromiseRef.current;

    setStatus("initializing");

    const promise = initWebgazer()
      .then(() => {
        setStatus("ready");
        setError(null);
      })
      .catch(err => {
        setStatus("error");
        setError(err instanceof Error ? err : new Error(String(err)));
        initPromiseRef.current = null;
        throw err;
      });

    initPromiseRef.current = promise;
    return promise;
  }, []);

  const ensureReady = useCallback(async () => {
    if (status === "ready") return;
    await initialize();
  }, [initialize, status]);

  const startCalibration = useCallback(async () => {
    await ensureReady();
    clearTrainingData();
    resumeManager();
    setIsCalibrating(true);
  }, [ensureReady]);

  const finishCalibration = useCallback(() => {
    setIsCalibrating(false);
  }, []);

  const recordCalibrationPoint = useCallback((x, y, type = "click") => {
    recordScreenPosition(x, y, type);
  }, []);

  const stopTracking = useCallback(() => {
    if (!listenerActiveRef.current) return;
    clearGazeListener();
    listenerActiveRef.current = false;
  }, []);

  const startTracking = useCallback(
    async (listener) => {
      await ensureReady();

      const combinedListener = data => {
        setLatestGaze(data);
        if (listener) listener(data);
        gazeCallbackRef.current(data);
      };

      setGazeListener(combinedListener);
      listenerActiveRef.current = true;
    },
    [ensureReady]
  );

  const pause = useCallback(() => {
    pauseManager();
  }, []);

  const resume = useCallback(async () => {
    await ensureReady();
    resumeManager();
  }, [ensureReady]);

  const shutdown = useCallback(() => {
    stopTracking();
    shutdownManager();
    setStatus("idle");
    setError(null);
    setLatestGaze(null);
    setIsCalibrating(false);
    initPromiseRef.current = null;
  }, [stopTracking]);

  const getPrediction = useCallback(() => {
    return getCurrentPrediction();
  }, []);

  const distanceFrom = useCallback((x, y) => {
    return distanceToTarget(x, y);
  }, []);

  useEffect(() => {
    if (!autoInit) return undefined;

    initialize();

    return () => {
      if (autoShutdown) {
        shutdown();
      } else {
        stopTracking();
      }
    };
  }, [autoInit, autoShutdown, initialize, shutdown, stopTracking]);

  return {
    status,
    error,
    isCalibrating,
    latestGaze,
    initialize,
    startCalibration,
    finishCalibration,
    recordCalibrationPoint,
    startTracking,
    stopTracking,
    pause,
    resume,
    shutdown,
    getPrediction,
    distanceFrom,
  };
}
