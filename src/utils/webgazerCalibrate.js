// Quick and dirty calibration helper that momentarily shows the webcam feed
// and prediction dots so users can look at screen anchors before we hide UI again.
export function runWebgazerCalibration() {
  if (!window.webgazer) {
    console.warn("WebGazer not loaded yet");
    return;
  }

  // Show webcam and prediction points for calibration
  window.webgazer.showVideo(true);
  window.webgazer.showPredictionPoints(true);

  console.log("Look at screen corners + center for ~20 seconds...");

  // Hide visuals after 20 seconds
  setTimeout(() => {
    window.webgazer.showVideo(false);
    window.webgazer.showPredictionPoints(false);
    console.log("Calibration done.");
  }, 20000);
}
