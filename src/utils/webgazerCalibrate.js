// Helpers for showing/hiding/positioning the WebGazer debug video during calibration.

const VIDEO_ID = "webgazerVideoFeed";
const VIDEO_WRAPPER_ID = "webgazerVideoCanvas"; // WebGazer creates this element alongside the feed
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
  { id: "top-left", label: "Look at the top-left corner" },
  { id: "top-right", label: "Now focus on the top-right corner" },
  { id: "bottom-right", label: "Next, look at the bottom-right corner" },
  { id: "bottom-left", label: "Shift to the bottom-left corner" },
  { id: "center", label: "Finally, look at the center" },
];

function applyStyle(node, style = DEFAULT_STYLE) {
  if (!node) return;
  node.style.position = "fixed";
  node.style.zIndex = "2147483647"; // keep above app overlay text
  node.style.pointerEvents = "none";
  node.style.top = "";
  node.style.bottom = "";
  node.style.left = "";
  node.style.right = "";
  node.style.transform = "";
  if (style.top) node.style.top = style.top;
  if (style.bottom) node.style.bottom = style.bottom;
  if (style.left) node.style.left = style.left;
  if (style.right) node.style.right = style.right;
  if (style.transform) node.style.transform = style.transform;
}

function ensureOriginalParent(wrapper) {
  if (!originalWrapperParent && wrapper?.parentElement) {
    originalWrapperParent = wrapper.parentElement;
  }
}

export function showWebgazerVideo(positionId, mountNode) {
  if (!window.webgazer) return;
  window.webgazer.showVideo(true);
  window.webgazer.showPredictionPoints(true);
  const video = document.getElementById(VIDEO_ID);
  const wrapper = document.getElementById(VIDEO_WRAPPER_ID);
  if (!video || !wrapper) return;

  ensureOriginalParent(wrapper);

  if (mountNode) {
    mountNode.appendChild(wrapper);
    wrapper.style.position = "relative";
    wrapper.style.top = "";
    wrapper.style.left = "";
    wrapper.style.right = "";
    wrapper.style.bottom = "";
    wrapper.style.transform = "";
    wrapper.style.width = "180px";
    wrapper.style.height = "120px";
    wrapper.style.borderRadius = "0.75rem";
    video.style.position = "static";
    video.style.width = "100%";
    video.style.height = "100%";
    video.style.borderRadius = "inherit";
  } else {
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
  window.webgazer.showPredictionPoints(false);
}

export function restoreWebgazerVideo() {
  const wrapper = document.getElementById(VIDEO_WRAPPER_ID);
  if (originalWrapperParent && wrapper && wrapper.parentElement !== originalWrapperParent) {
    originalWrapperParent.appendChild(wrapper);
  }
  const video = document.getElementById(VIDEO_ID);
  applyStyle(video, DEFAULT_STYLE);
  applyStyle(wrapper, DEFAULT_STYLE);
  wrapper.style.width = "";
  wrapper.style.height = "";
}
