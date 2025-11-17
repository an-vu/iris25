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

const noop = () => { };

/**
 * useWebGazer
 *
 * High-level React wrapper around WebGazer.
 * This hook hides all the low-level API calls and exposes a clean interface
 * that the UI (IrisManager, calibration screens, reader page) can use.
 *
 * WebgazerManager = raw WebGazer engine
 * useWebGazer      = React-friendly control and state
 */
export function useWebGazer(options = {}) {
  const {
    autoInit = false,     // initialize WebGazer automatically on mount
    autoShutdown = true,  // shut everything down when unmounting
    onGaze = noop,        // optional callback every time a gaze point arrives
  } = options;

  // WebGazer lifecycle + internal state for the UI
  const [status, setStatus] = useState("idle"); // idle | initializing | ready | error
  const [error, setError] = useState(null);
  const [latestGaze, setLatestGaze] = useState(null); // latest {x, y} gaze point
  const [isCalibrating, setIsCalibrating] = useState(false);

  // Refs used to track async behavior and state that shouldn't cause rerenders
  const initPromiseRef = useRef(null);  // ensures initialize() only runs once
  const gazeCallbackRef = useRef(onGaze); // always-current onGaze callback
  const listenerActiveRef = useRef(false); // whether a tracking listener is attached

  /**
   * Keep the latest onGaze callback updated.
   * This avoids stale closures when the parent component re-renders.
   */
  useEffect(() => {
    gazeCallbackRef.current = onGaze || noop;
  }, [onGaze]);

  /**
   * initialize()
   *
   * Boot WebGazer. Only runs once even if multiple calls happen at the same time.
   * Updates the status so the UI knows what's going on.
   */
  const initialize = useCallback(async () => {
    // If initialization is already in progress or completed, reuse the same promise.
    if (initPromiseRef.current) return initPromiseRef.current;

    setStatus("initializing");

    const promise = initWebgazer()
      .then(() => {
        setStatus("ready");
        setError(null);
      })
      .catch(err => {
        // Convert errors into a standard Error object.
        setStatus("error");
        setError(err instanceof Error ? err : new Error(String(err)));
        initPromiseRef.current = null; // allow retry
        throw err;
      });

    initPromiseRef.current = promise;
    return promise;
  }, []);

  /**
   * ensureReady()
   *
   * Helper that guarantees WebGazer is initialized before using anything else.
   */
  const ensureReady = useCallback(async () => {
    if (status === "ready") return;
    await initialize();
  }, [initialize, status]);

  /**
   * startCalibration()
   *
   * Reset old calibration data, resume WebGazer, and signal that calibration is active.
   */
  const startCalibration = useCallback(async () => {
    await ensureReady();
    clearTrainingData(); // wipe old calibration so the new one is clean
    resumeManager();     // make sure WebGazer is actively tracking
    setIsCalibrating(true);
  }, [ensureReady]);

  /**
   * finishCalibration()
   *
   * UI stops showing calibration mode, but WebGazer keeps running.
   */
  const finishCalibration = useCallback(() => {
    setIsCalibrating(false);
  }, []);

  /**
   * recordCalibrationPoint(x, y)
   *
   * Record a labeled sample at the given screen coordinates.
   * Called for dot-click or gaze-hold data.
   */
  const recordCalibrationPoint = useCallback((x, y, type = "click") => {
    recordScreenPosition(x, y, type);
  }, []);

  /**
   * stopTracking()
   *
   * Remove the gaze listener if active.
   * ListenerActiveRef prevents double-clearing.
   */
  const stopTracking = useCallback(() => {
    if (!listenerActiveRef.current) return;
    clearGazeListener();
    listenerActiveRef.current = false;
  }, []);

  /**
   * startTracking()
   *
   * Attach a listener for gaze points. Each gaze update:
   *  - updates React state
   *  - calls the optional per-call listener
   *  - calls the global onGaze callback
   */
  const startTracking = useCallback(
    async (listener) => {
      await ensureReady();

      // Wrap the listener chain into one function
      const combinedListener = data => {
        setLatestGaze(data);  // update component state
        if (listener) listener(data);
        gazeCallbackRef.current(data); // always-latest onGaze
      };

      setGazeListener(combinedListener);
      listenerActiveRef.current = true;
    },
    [ensureReady]
  );

  /**
   * pause()
   *
   * Just pass through to the engine-level pause.
   */
  const pause = useCallback(() => {
    pauseManager();
  }, []);

  /**
   * resume()
   *
   * Ensure WebGazer is ready, then resume tracking.
   */
  const resume = useCallback(async () => {
    await ensureReady();
    resumeManager();
  }, [ensureReady]);

  /**
   * shutdown()
   *
   * Fully stop tracking, kill WebGazer engine, and reset all internal state.
   */
  const shutdown = useCallback(() => {
    stopTracking();
    shutdownManager();
    setStatus("idle");
    setError(null);
    setLatestGaze(null);
    setIsCalibrating(false);
    initPromiseRef.current = null; // allow re-init later
  }, [stopTracking]);

  /**
   * getPrediction()
   *
   * Optional getter for raw WebGazer prediction (without listener).
   */
  const getPrediction = useCallback(() => {
    return getCurrentPrediction();
  }, []);

  /**
   * distanceFrom(x, y)
   *
   * Helper used during calibration step to measure accuracy
   * ("how far is the predicted point from the target point?").
   */
  const distanceFrom = useCallback((x, y) => {
    return distanceToTarget(x, y);
  }, []);

  /**
   * Auto-init and auto-shutdown behavior.
   *
   * If autoInit=true:
   *   - run initialize() immediately
   *
   * On unmount:
   *   - shutdown() if autoShutdown=true
   *   - otherwise just stopTracking()
   */
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

  /**
   * Exposed API for React components.
   */
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
