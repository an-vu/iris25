const VIDEO_ID = "webgazerVideoFeed";
const VIDEO_WRAPPER_ID = "webgazerVideoCanvas";
let originalWrapperParent = null;

const DEFAULT_STYLE = {
  top: "16px",
  left: "16px",
};

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

export function showWebgazerVideo(positionId, mountNode, positionStyles = {}) {
  if (!window.webgazer) return;
  window.webgazer.showVideo(true);
  window.webgazer.showFaceOverlay(true);
  window.webgazer.showFaceFeedbackBox(true);
  window.webgazer.showPredictionPoints(true);

  const video = document.getElementById(VIDEO_ID);
  const wrapper = document.getElementById(VIDEO_WRAPPER_ID);
  if (!video || !wrapper) return;

  ensureOriginalParent(wrapper);

  if (mountNode) {
    mountNode.style.position = "relative";
    mountNode.appendChild(wrapper);
    applyOverlayStyles(wrapper, video);
  } else {
    if (originalWrapperParent && wrapper.parentElement !== originalWrapperParent) {
      originalWrapperParent.appendChild(wrapper);
    }
    const style = positionStyles[positionId] || DEFAULT_STYLE;
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
