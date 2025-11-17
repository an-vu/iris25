import webgazer from "webgazer";

/*
  WebGazer lifecycle manager.
  This file handles:
  - initializing WebGazer
  - collecting calibration data
  - reading gaze predictions
  - pausing/resuming
  - shutting down
  - managing event listeners
*/

const noop = () => {};
let initialized = false;
let gazeDispatcher = null; // internal WebGazer handler
const gazeSubscribers = new Set(); // every consumer that wants gaze events


/* --------------------------------------------------------------------------
 * INIT
 * -------------------------------------------------------------------------- */

export async function initWebgazer() {
    // Prevent double init
    if (initialized) return;

    // WebGazer breaks if DOM isn't ready
    await waitForDOM();

    // Start WebGazer with our model + tracker
    await webgazer
        .setRegression("weightedRidge")   // math model for mapping eyes-screen coords
        .setTracker("tffacemesh")         // face landmark tracker
        .begin();

    // WebGazer UI
    webgazer.showVideoPreview(true);
    webgazer.showPredictionPoints(true);
    webgazer.showFaceOverlay(true);
    webgazer.showFaceFeedbackBox(true);

    // Avoid loading old calibration from browser storage
    webgazer.saveDataAcrossSessions(false);

    initialized = true;

    if (gazeSubscribers.size > 0) {
        startGazeStream();
    }
}


/* --------------------------------------------------------------------------
 * WAIT FOR DOM
 * -------------------------------------------------------------------------- */

function waitForDOM() {
    /*
      WebGazer needs the DOM tree, not full assets.
      We wait until readyState hits "interactive" or "complete".
    */

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


/* --------------------------------------------------------------------------
 * CALIBRATION (IMPORTANT)
 * -------------------------------------------------------------------------- */

export function recordScreenPosition(x, y, type = "click") {
    /*
      When user clicks a calibration point,
      we send clean training data to WebGazer.
  
      Feed calibration samples into WebGazer.
      IMPORTANT:
        Pass actual screen coordinates (clientX/clientY),
        not relative positions (like event.offsetX).
      If you later support other event types ('move', 'stare'), branch on 'type'.
    */
    if (!initialized) return;
    webgazer.recordScreenPosition(x, y, type);
}

export function clearTrainingData() {
    if (!initialized) return;
    webgazer.clearData(); // wipes all calibration samples
}


/* --------------------------------------------------------------------------
 * GAZE LISTENERS (React-friendly)
 * -------------------------------------------------------------------------- */

function startGazeStream() {
    if (!initialized || gazeDispatcher || gazeSubscribers.size === 0) return;

    gazeDispatcher = (data, clock) => {
        if (!data) return;
        const payload = { x: data.x, y: data.y };

        gazeSubscribers.forEach(listener => {
            try {
                listener(payload);
            } catch (err) {
                // Don’t let a consumer crash the dispatcher.
                console.error("WebGazer listener error:", err);
            }
        });
    };

    webgazer.setGazeListener(gazeDispatcher);
}

function stopGazeStream() {
    if (gazeDispatcher && initialized) {
        webgazer.clearGazeListener();
    }
    gazeDispatcher = null;
}

export function addGazeListener(callback) {
    if (typeof callback !== "function") return noop;

    gazeSubscribers.add(callback);
    startGazeStream();

    return () => removeGazeListener(callback);
}

export function removeGazeListener(callback) {
    if (typeof callback !== "function") return;

    gazeSubscribers.delete(callback);
    if (gazeSubscribers.size === 0) {
        stopGazeStream();
    }
}

export function setGazeListener(callback) {
    /*
    Registers a gaze listener, clearing any previous ones.
    Kept for backward compatibility with existing hook code.
    */
    clearGazeListener();
    return addGazeListener(callback);
}

export function clearGazeListener(callback) {
    if (typeof callback === "function") {
        removeGazeListener(callback);
        return;
    }

    gazeSubscribers.clear();
    stopGazeStream();
}


/* --------------------------------------------------------------------------
 * CONTROL (pause/resume/end)
 * -------------------------------------------------------------------------- */

export function pause() {
    /*
      pause() stops prediction but keeps calibration.
      Useful when user toggles Iris OFF temporarily.
    */
    if (!initialized) return;
    webgazer.pause();
}

export function resume() {
    /*
      resume() restarts prediction instantly
      without requiring recalibration.
    */
    if (!initialized) return;
    webgazer.resume();
}

export function shutdown() {
    /*
    Full shutdown:
        - stops prediction + camera
        - clears internal WebGazer callbacks
        - resets manager state
    NOTE:
        resume() after shutdown will NOT auto-restore a gaze listener.
        You must call setGazeListener() again after re-init.
    */

    if (!initialized) return;

    try {
        webgazer.end();
    } catch (e) {
        // avoid crash if webgazer throws internal errors
    }

    stopGazeStream();
    gazeSubscribers.clear();
    initialized = false;
}


/* --------------------------------------------------------------------------
 * ACCURACY / UTILITIES
 * -------------------------------------------------------------------------- */

export function getCurrentPrediction() {
    /*
      Returns the latest predicted gaze point.
      Useful for "stare at the dot" calibration steps.
    */
    if (!initialized) return null;
    return webgazer.getCurrentPrediction();
}

export function distanceToTarget(targetX, targetY) {
    /*
      Calculates how close the current prediction is
      to a specific screen location.
      Lower = better accuracy.
    */
    const pred = getCurrentPrediction();
    if (!pred) return null;

    const dx = pred.x - targetX;
    const dy = pred.y - targetY;
    return Math.sqrt(dx * dx + dy * dy);
}

export function getStoredSamples() {
    /*
      Access all calibration samples directly.
      Useful only if you're analyzing variance.
    */
    if (!initialized) return [];
    return webgazer.getStoredData() || [];
}
