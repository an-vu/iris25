// src/utils/webgazerCalibrate.js
// Handles showing, hiding, and positioning the WebGazer debug video during calibration.

const VIDEO_ID = "webgazerVideoFeed";
const VIDEO_WRAPPER_ID = "webgazerVideoCanvas"; // created by WebGazer internally
let originalWrapperParent = null;

const DEFAULT_STYLE = {
  top: "16px",
  left: "16px",
};

export const POSITION_STYLES = {
  "top-left": { top: "16px", left: "16px" },
  "top-right": { top: "16px", right: "16px" },
  "bottom-right": { bottom: "16px", right: "16px" },
  "bottom-left": { bottom: "16px", left: "16px" },
  center: { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
};

export const CALIBRATION_POSITIONS = [
  { id: "top-left", x: 0.15, y: 0.15, label: "Look at the top-left point and click it five times." },
  { id: "top-center", x: 0.5, y: 0.15, label: "Move to the top-center point, keep your gaze there, and click five times." },
  { id: "top-right", x: 0.85, y: 0.15, label: "Focus on the top-right point and click five times." },
  { id: "middle-left", x: 0.15, y: 0.5, label: "Look at the middle-left point and click five times." },
  { id: "center", x: 0.5, y: 0.5, label: "Stay centered and click five times." },
  { id: "middle-right", x: 0.85, y: 0.5, label: "Look at the middle-right point and click five times." },
  { id: "bottom-left", x: 0.15, y: 0.85, label: "Look at the bottom-left point and click five times." },
  { id: "bottom-center", x: 0.5, y: 0.85, label: "Look at the bottom-center point and click five times." },
  { id: "bottom-right", x: 0.85, y: 0.85, label: "Look at the bottom-right point and click five times." },
];

// ---------------- helpers ----------------
function applyStyle(node, style = DEFAULT_STYLE) {
  if (!node) return;
  node.style.position = "fixed";
  node.style.zIndex = "2147483647";
  node.style.pointerEvents = "none";
  node.style.top = "";
  node.style.bottom = "";
  node.style.left = "";
  node.style.right = "";
  node.style.transform = "";

  for (const key in style) node.style[key] = style[key];
}

function ensureOriginalParent(wrapper) {
  if (!originalWrapperParent && wrapper?.parentElement) {
    originalWrapperParent = wrapper.parentElement;
  }
}

function applyOverlayStyles(wrapper, video) {
  if (!wrapper || !video) return;
  wrapper.style.setProperty("position", "absolute", "important");
  wrapper.style.setProperty("top", "0", "important");
  wrapper.style.setProperty("left", "0", "important");
  wrapper.style.setProperty("width", "100%", "important");
  wrapper.style.setProperty("height", "100%", "important");
  wrapper.style.borderRadius = "0.75rem";
  wrapper.style.overflow = "hidden";

  video.style.setProperty("position", "absolute", "important");
  video.style.setProperty("top", "0", "important");
  video.style.setProperty("left", "0", "important");
  video.style.setProperty("width", "100%", "important");
  video.style.setProperty("height", "100%", "important");
  video.style.borderRadius = "inherit";
  video.style.objectFit = "cover";
}

// ---------------- main functions ----------------
export function showWebgazerVideo(positionId, mountNode) {
  if (!window.webgazer) return;
  window.webgazer.showVideo(true);
  window.webgazer.showFaceOverlay(true);
  window.webgazer.showFaceFeedbackBox(true);
  window.webgazer.showPredictionPoints(true);

  const video = document.getElementById(VIDEO_ID);
  const wrapper = document.getElementById(VIDEO_WRAPPER_ID);
  if (!video || !wrapper) return;

  ensureOriginalParent(wrapper);

  // mount inside overlay if available
  if (mountNode) {
    mountNode.style.position = "relative"; // allow absolute children
    mountNode.appendChild(wrapper);
    applyOverlayStyles(wrapper, video);
  } else {
    // fallback to fixed positioning
    if (originalWrapperParent && wrapper.parentElement !== originalWrapperParent) {
      originalWrapperParent.appendChild(wrapper);
    }
    const style = POSITION_STYLES[positionId] || DEFAULT_STYLE;
    applyStyle(video, style);
    applyStyle(wrapper, style);
    wrapper.style.width = "";
    wrapper.style.height = "";
  }
}

export function hideWebgazerVideo() {
  if (!window.webgazer) return;
  window.webgazer.showVideo(false);
  window.webgazer.showFaceOverlay(false);
  window.webgazer.showFaceFeedbackBox(false);
  window.webgazer.showPredictionPoints(false);
}

export function restoreWebgazerVideo() {
  const wrapper = document.getElementById(VIDEO_WRAPPER_ID);
  const video = document.getElementById(VIDEO_ID);
  if (!wrapper || !video) return;

  if (originalWrapperParent && wrapper.parentElement !== originalWrapperParent) {
    originalWrapperParent.appendChild(wrapper);
  }

  applyStyle(video, DEFAULT_STYLE);
  applyStyle(wrapper, DEFAULT_STYLE);
  wrapper.style.removeProperty("width");
  wrapper.style.removeProperty("height");
  video.style.removeProperty("position");
}
