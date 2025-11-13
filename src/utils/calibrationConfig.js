// src/utils/calibrationConfig.js

export const CALIBRATION_POINTS = [
  { id: "top-left", x: 0.1, y: 0.1, label: "Top left (look and click five times)" },
  { id: "top-center", x: 0.5, y: 0.1, label: "Top center (look and click five times)" },
  { id: "top-right", x: 0.9, y: 0.1, label: "Top right (look and click five times)" },
  { id: "mid-left", x: 0.1, y: 0.5, label: "Middle left (look and click five times)" },
  { id: "center", x: 0.5, y: 0.5, label: "Center (look and click five times)" },
  { id: "mid-right", x: 0.9, y: 0.5, label: "Middle right (look and click five times)" },
  { id: "bottom-left", x: 0.1, y: 0.9, label: "Bottom left (look and click five times)" },
  { id: "bottom-center", x: 0.5, y: 0.9, label: "Bottom center (look and click five times)" },
  { id: "bottom-right", x: 0.9, y: 0.9, label: "Bottom right (look and click five times)" },
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
