// For more info, check out https://github.com/brownhci/WebGazer/wiki/Top-Level-API

import webgazer from "webgazer"; // WebGazer library

/* -----------------------------------------------------------
   GLOBAL STATE
----------------------------------------------------------- */

// No-op fallback function
// Used as a safe fallback when someone provides an invalid callback.
// Keeps the API stable so calling the returned unsubscribe function never crashes.
const noop = () => { };

// Tracks if WebGazer has already been initialized.
// Needed so we don't accidentally run initWebgazer() multiple times.
let initialized = false;

// All active gaze subscribers.
// A "subscriber" is anything that signs up to receive gaze updates.
// When someone calls addGazeListener(fn), they become a subscriber.
// We track subscribers so:
// - we know who wants gaze data
// - we can deliver each update to everyone who subscribed
// - we can remove them cleanly when they unsubscribe
// - we can start or stop the gaze stream based on whether the set is empty
let gazeDispatcher = null;

// All active gaze listeners.
// A "listener" is a function we call every time WebGazer produces new x,y data.
// We store them here so:
// - we can notify everyone on each update
// - we can add/remove listeners safely
// - we can stop the stream when the set becomes empty
const gazeSubscribers = new Set();

// Whether WebGazer's built-in mouse-click training is turned on.
// We track this so we can enable/disable it cleanly without guesswork.
let trainingEnabled = true;


/* -----------------------------------------------------------
   INITIALIZATION
----------------------------------------------------------- */

/**
 * Initialize WebGazer once, configure its models,
 * and start streaming if listeners already exist.
 */
export async function initWebgazer() {
    if (initialized) return;

    await waitForDOM();

    await webgazer
        .setRegression("weightedRidge")
        .setTracker("tffacemesh")
        .begin();

    // Enable built-in WebGazer visual debugging overlays
    // Keep these on to know what WebGazer is seeing
    webgazer.showVideoPreview(true);
    webgazer.showPredictionPoints(true);
    webgazer.showFaceOverlay(true);
    webgazer.showFaceFeedbackBox(true);

    // Smooth noisy predictions
    // Would prefer to have this enabled as it improves accuracy %
    webgazer.applyKalmanFilter(true);

    // Persist training data across sessions
    // This might help accuracy over time
    // But could also lead to worse results if the user changes environment
    webgazer.saveDataAcrossSessions(true);

    initialized = true;

    // If someone added listeners before init, start streaming
    if (gazeSubscribers.size > 0) {
        startGazeStream();
    }
}

/**
 * Wait until DOM is ready before starting WebGazer’s video elements.
 */
function waitForDOM() {
    return new Promise(resolve => {
        if (
            document.readyState === "complete" ||
            document.readyState === "interactive"
        ) {
            return resolve();
        }

        const handler = () => {
            document.removeEventListener("DOMContentLoaded", handler);
            resolve();
        };

        document.addEventListener("DOMContentLoaded", handler);
    });
}


/* -----------------------------------------------------------
   TRAINING & DATA MANAGEMENT
----------------------------------------------------------- */

/**
 * Clear all WebGazer training data (stored regression pairs).
 */
export function clearTrainingData() {
    if (!initialized) return;
    webgazer.clearData();
}

/**
 * Toggle whether WebGazer should store future calibration points.
 */
export function setPredictionStorage(enabled) {
    if (!initialized) return;
    webgazer.params.storingPoints = Boolean(enabled);
}

/**
 * Manually clear stored prediction points without clearing everything else.
 */
export function clearStoredPredictionPoints() {
    if (!initialized || typeof webgazer.getStoredPoints !== "function") return;
    const [xPoints, yPoints] = webgazer.getStoredPoints();
    if (Array.isArray(xPoints)) xPoints.length = 0;
    if (Array.isArray(yPoints)) yPoints.length = 0;
}

/**
 * Force Kalman smoothing on. Ignore attempts to disable it for stability.
 */
export function setKalmanFilter(enabled) {
    if (!initialized) return;
    webgazer.applyKalmanFilter(true);
}

/**
 * Re-enable WebGazer's built-in mouse-click training.
 */
// This allow clicks during calibration to train the model
export function enableTraining() {
    if (!initialized || trainingEnabled) return;
    try {
        webgazer.addMouseEventListeners();
        trainingEnabled = true;
    } catch (error) {
        console.warn("WebGazer addMouseEventListeners failed:", error);
    }
}

/**
 * Disable WebGazer's built-in mouse-click training.
 */
// This prevents random UI clicks from ruining calibration.
export function disableTraining() {
    if (!initialized || !trainingEnabled) return;
    try {
        webgazer.removeMouseEventListeners();
        trainingEnabled = false;
    } catch (error) {
        console.warn("WebGazer removeMouseEventListeners failed:", error);
    }
}

/**
 * Stop the webcam video stream.
 */
export function stopVideoStream() {
    if (!initialized) return;
    try {
        webgazer.stopVideo();
    } catch (error) {
        console.warn("WebGazer stopVideo failed:", error);
    }
}

/**
 * Return all stored calibration points [x[], y[]].
 * WebGazer collects these during training to build its prediction model.
 * We expose them so we can:
 * - check how many points were recorded
 * - calculate calibration accuracy
 * - debug or visualize training data
 * If WebGazer isn't ready, return empty arrays to keep things safe.
 */
export function getStoredPredictionPoints() {
    if (!initialized || typeof webgazer.getStoredPoints !== "function") {
        return [[], []];
    }
    return webgazer.getStoredPoints();
}

/**
 * Completely wipe all WebGazer training data, then stop new points
 * from being stored until training is re-enabled.
 * Needed when:
 * - user wants to recalibrate from scratch
 * - old/bad training data is corrupting accuracy
 * - switching users and starting fresh
 * This keeps your custom calibration flow clean and predictable.
 */
export function resetWebgazerData() {
    if (!initialized) return;
    try {
        webgazer.clearData();
    } catch (error) {
        console.warn("WebGazer clearData failed:", error);
    }
    setPredictionStorage(false);
}


/* -----------------------------------------------------------
   GAZE STREAM DISPATCHING
----------------------------------------------------------- */

/**
 * Start the internal gaze stream.
 * This connects WebGazer's raw prediction feed to our subscribers.
 *
 * How it works:
 * - WebGazer calls gazeDispatcher every time it has new x,y data.
 * - We turn that into a simple payload { x, y }.
 * - Then we forward it to every subscriber (any function added through addGazeListener).
 *
 * Why needed:
 * - It keeps all gaze updates going through one clean dispatch point.
 * - We only start streaming when there is at least one subscriber.
 * - Prevents wasted processing when no one is listening.
 */
function startGazeStream() {
    if (!initialized || gazeDispatcher || gazeSubscribers.size === 0) return;

    gazeDispatcher = (data, clock) => {
        if (!data) return;

        const payload = { x: data.x, y: data.y };

        // Push gaze coords to all subscribed listeners
        gazeSubscribers.forEach(listener => {
            try {
                listener(payload);
            } catch (err) {
                console.error("WebGazer listener error:", err);
            }
        });
    };

    webgazer.setGazeListener(gazeDispatcher);
}

/**
 * Stop the gaze stream.
 * This removes our dispatcher from WebGazer so we stop receiving updates.
 *
 * Why needed:
 * - Prevents unnecessary processing when no subscribers exist.
 * - Avoids keeping the webcam/gaze pipeline active when not in use.
 * - Keeps memory clean and avoids duplicate listeners.
 */
function stopGazeStream() {
    if (gazeDispatcher && initialized) {
        webgazer.clearGazeListener();
    }
    gazeDispatcher = null;
}


/* -----------------------------------------------------------
   PUBLIC GAZE LISTENER API
----------------------------------------------------------- */

/**
 * Add a new gaze listener.
 * A listener is a function that receives { x, y } gaze updates.
 *
 * What this does:
 * - Ignore invalid callbacks (return a safe no-op).
 * - Add the listener to our subscriber list.
 * - Start the gaze stream if this is the first subscriber.
 *
 * Why needed:
 * - Lets any part of the app react to gaze data.
 * - Keeps the API clean: add listener in one call, get gaze updates instantly.
 * - Returns an unsubscribe function so callers can easily detach.
 */
export function addGazeListener(callback) {
    if (typeof callback !== "function") return noop;

    gazeSubscribers.add(callback);
    startGazeStream();

    return () => removeGazeListener(callback);
}

/**
 * Remove a specific gaze listener.
 *
 * What this does:
 * - Stops sending gaze updates to the given callback.
 * - If this was the last listener, shut down the gaze stream.
 *
 * Why needed:
 * - Prevents memory leaks.
 * - Avoids calling old or dead functions.
 * - Saves performance by stopping the stream when no one is listening.
 */
export function removeGazeListener(callback) {
    if (typeof callback !== "function") return;

    gazeSubscribers.delete(callback);

    // If no one left, stop the stream
    if (gazeSubscribers.size === 0) {
        stopGazeStream();
    }
}

/**
 * Replace all listeners with just one new listener.
 *
 * What this does:
 * - Clears out all previous subscribers.
 * - Adds only the new listener.
 *
 * Why needed:
 * - Useful when you want exclusive control over gaze data.
 * - Prevents multiple components from receiving updates at the same time.
 */
export function setGazeListener(callback) {
    clearGazeListener();
    return addGazeListener(callback);
}

/**
 * Clear all listeners, or remove only the given one.
 *
 * What this does:
 * - If a callback is provided, remove only that one.
 * - If none is provided, wipe the entire subscriber list.
 * - Stop the gaze stream when no listeners remain.
 *
 * Why needed:
 * - Lets you cleanly shut down all gaze consumers (ex: switching pages).
 * - Avoids leftover listeners from old components.
 * - Keeps streaming only when necessary.
 */
export function clearGazeListener(callback) {
    if (typeof callback === "function") {
        removeGazeListener(callback);
        return;
    }

    gazeSubscribers.clear();
    stopGazeStream();
}


/* -----------------------------------------------------------
   SHUTDOWN
----------------------------------------------------------- */

/**
 * Fully shut down WebGazer, webcam, training, and listeners.
 */
export function shutdown() {
    if (!initialized) return;

    try {
        webgazer.end();
    } catch (e) { }

    disableTraining();
    stopGazeStream();
    gazeSubscribers.clear();
    initialized = false;
    trainingEnabled = true;
}
