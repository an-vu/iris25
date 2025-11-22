import {
    useCallback,
    useEffect,
    useRef,
    useState
} from "react";
import {
  initWebgazer,
  shutdown as shutdownManager,
  clearTrainingData,
  setPredictionStorage,
  getStoredPredictionPoints,
  clearStoredPredictionPoints,
  resetWebgazerData,
  setKalmanFilter,
  stopVideoStream,
  addGazeListener,
  removeGazeListener,
  enableTraining,
  disableTraining,
} from "../webgazerManager.js";

const noop = () => {};

export function useWebGazer(options = {}) {
    const {
        autoInit = false,
            autoShutdown = true,
            onGaze = noop,
    } = options;

    const [status, setStatus] = useState("idle");
    const [error, setError] = useState(null);
    const [latestGaze, setLatestGaze] = useState(null);
    const [isCalibrating, setIsCalibrating] = useState(false);

    const initPromiseRef = useRef(null);
    const gazeCallbackRef = useRef(onGaze);
    const listenerActiveRef = useRef(false);
    const unsubscribeRef = useRef(null);

    useEffect(() => {
        gazeCallbackRef.current = onGaze || noop;
    }, [onGaze]);

    const initialize = useCallback(async() => {
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

    const ensureReady = useCallback(async() => {
        if (status === "ready") return;
        await initialize();
    }, [initialize, status]);

    const startCalibration = useCallback(async() => {
        await ensureReady();
        clearTrainingData();
        setIsCalibrating(true);
    }, [ensureReady]);

    const finishCalibration = useCallback(() => {
        setIsCalibrating(false);
    }, []);

    const stopTracking = useCallback(() => {
        if (!listenerActiveRef.current) return;
        if (typeof unsubscribeRef.current === "function") {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        } else {
          removeGazeListener(gazeCallbackRef.current);
        }
        listenerActiveRef.current = false;
    }, []);

    const startTracking = useCallback(
        async(listener) => {
            await ensureReady();

            const combinedListener = data => {
                setLatestGaze(data);
                if (listener) listener(data);
                gazeCallbackRef.current(data);
            };

            const unsubscribe = addGazeListener(combinedListener);
            unsubscribeRef.current = unsubscribe;
            listenerActiveRef.current = true;
        }, [ensureReady]
    );

    const shutdown = useCallback(() => {
        stopTracking();
        stopVideoStream();
        shutdownManager();
        setStatus("idle");
        setError(null);
        setLatestGaze(null);
        setIsCalibrating(false);
        initPromiseRef.current = null;
    }, [stopTracking]);

  const measurePrecision = useCallback(
        async(durationMs = 5000) => {
      await ensureReady();
            try {
                clearStoredPredictionPoints();
                setPredictionStorage(true);
                await delay(durationMs);
            } finally {
                setPredictionStorage(false);
            }
            const samples = getStoredPredictionPoints();
            return computePrecision(samples);
        }, [ensureReady]
    );

    const restartCalibration = useCallback(() => {
        resetWebgazerData();
        setIsCalibrating(false);
    }, []);

    const toggleKalmanFilter = useCallback((enabled) => {
        setKalmanFilter(enabled);
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
        startTracking,
        stopTracking,
      shutdown,
      measurePrecision,
      restartCalibration,
      toggleKalmanFilter,
      enableTraining,
      disableTraining,
    };
}

function computePrecision([xSamples = [], ySamples = []]) {
    if (!xSamples.length || !ySamples.length) {
        return {
            score: 0,
            quality: "Unknown",
            avgDistance: null
        };
    }

    const targetX = window.innerWidth / 2;
    const targetY = window.innerHeight / 2;
    const maxLength = Math.min(50, xSamples.length, ySamples.length);
    const x50 = xSamples.slice(-maxLength);
    const y50 = ySamples.slice(-maxLength);

    const precisionPercentages = new Array(maxLength);
    const distances = new Array(maxLength);

    for (let i = 0; i < maxLength; i += 1) {
        const dx = targetX - x50[i];
        const dy = targetY - y50[i];
        const distance = Math.sqrt(dx * dx + dy * dy);
        distances[i] = distance;
        precisionPercentages[i] = calculatePrecisionPercent(distance, window.innerHeight);
    }

    const avgDistance =
        distances.reduce((sum, value) => sum + value, 0) / maxLength;
    const precisionScore =
        precisionPercentages.reduce((sum, value) => sum + value, 0) / maxLength;

    return {
        score: Math.round(precisionScore),
        quality: classifyPrecision(precisionScore),
        avgDistance,
    };
}

function calculatePrecisionPercent(distance, windowHeight) {
    const halfWindow = windowHeight / 2;
    if (distance <= halfWindow && distance >= 0) {
        return 100 - (distance / halfWindow) * 100;
    }
    return distance > halfWindow ? 0 : 100;
}

function classifyPrecision(score) {
    if (score >= 90) return "Excellent";
    if (score >= 75) return "Good";
    if (score >= 60) return "Fair";
    return "Poor";
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
