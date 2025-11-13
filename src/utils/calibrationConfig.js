// src/utils/calibrationConfig.js

const EDGE_OFFSET = 0.05; // keeps dots very close to the border without clipping

export const CALIBRATION_POINTS = [
  { id: "top-left", x: EDGE_OFFSET, y: EDGE_OFFSET, label: "Top left (look and click five times)" },
  { id: "top-center", x: 0.5, y: EDGE_OFFSET, label: "Top center (look and click five times)" },
  { id: "top-right", x: 1 - EDGE_OFFSET, y: EDGE_OFFSET, label: "Top right (look and click five times)" },
  { id: "mid-left", x: EDGE_OFFSET, y: 0.5, label: "Middle left (look and click five times)" },
  { id: "center", x: 0.5, y: 0.5, label: "Center (look and click five times)" },
  { id: "mid-right", x: 1 - EDGE_OFFSET, y: 0.5, label: "Middle right (look and click five times)" },
  { id: "bottom-left", x: EDGE_OFFSET, y: 1 - EDGE_OFFSET, label: "Bottom left (look and click five times)" },
  { id: "bottom-center", x: 0.5, y: 1 - EDGE_OFFSET, label: "Bottom center (look and click five times)" },
  { id: "bottom-right", x: 1 - EDGE_OFFSET, y: 1 - EDGE_OFFSET, label: "Bottom right (look and click five times)" },
];

export const REQUIRED_CLICKS_PER_POINT = 5;
export const ACCURACY_DURATION_MS = 5000;
export const ACCURACY_THRESHOLD_PX = 200;

export const ACCURACY_TIERS = [
  { min: 90, label: "Excellent" },
  { min: 75, label: "Good" },
  { min: 60, label: "Medium" },
  { min: 0, label: "Poor" },
];

export function getAccuracyTier(score) {
  const tier = ACCURACY_TIERS.find((t) => score >= t.min);
  return tier ? tier.label : "Poor";
}

export function buildCalibrationSequence() {
  const center = CALIBRATION_POINTS.find((p) => p.id === "center");
  const others = CALIBRATION_POINTS.filter((p) => p.id !== "center");
  const shuffled = [...others].sort(() => Math.random() - 0.5);
  if (center) shuffled.push(center);
  return shuffled;
}
