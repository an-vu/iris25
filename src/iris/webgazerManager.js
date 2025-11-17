import webgazer from "webgazer";

const noop = () => { };
let initialized = false;
let gazeDispatcher = null;
const gazeSubscribers = new Set();

export async function initWebgazer() {
    if (initialized) return;

    await waitForDOM();

    await webgazer
        .setRegression("weightedRidge")
        .setTracker("tffacemesh")
        .begin();

    webgazer.showVideoPreview(true);
    webgazer.showPredictionPoints(true);
    webgazer.showFaceOverlay(true);
    webgazer.showFaceFeedbackBox(true);
    webgazer.applyKalmanFilter(false); //

    webgazer.saveDataAcrossSessions(false);

    initialized = true;

    if (gazeSubscribers.size > 0) {
        startGazeStream();
    }
}

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

export function clearTrainingData() {
    if (!initialized) return;
    webgazer.clearData();
}

export function setPredictionStorage(enabled) {
    if (!initialized) return;
    webgazer.params.storingPoints = Boolean(enabled);
}

export function setKalmanFilter(enabled) {
    if (!initialized) return;
    webgazer.applyKalmanFilter(Boolean(enabled));
}

export function stopVideoStream() {
    if (!initialized) return;
    try {
        webgazer.stopVideo();
    } catch (error) {
        console.warn("WebGazer stopVideo failed:", error);
    }
}

export function getStoredPredictionPoints() {
    if (!initialized || typeof webgazer.getStoredPoints !== "function") {
        return [
            [],
            []
        ];
    }
    return webgazer.getStoredPoints();
}

export function resetWebgazerData() {
    if (!initialized) return;
    try {
        webgazer.clearData();
    } catch (error) {
        console.warn("WebGazer clearData failed:", error);
    }
    setPredictionStorage(false);
}


function startGazeStream() {
    if (!initialized || gazeDispatcher || gazeSubscribers.size === 0) return;

    gazeDispatcher = (data, clock) => {
        if (!data) return;
        const payload = {
            x: data.x,
            y: data.y
        };

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

export function shutdown() {

    if (!initialized) return;

    try {
        webgazer.end();
    } catch (e) { }

    stopGazeStream();
    gazeSubscribers.clear();
    initialized = false;
}
