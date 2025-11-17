// Single instant accuracy check.
// We only use one target (the center of the screen) and one prediction sample.

// Center of the screen
const CENTER_TARGET = { x: 0.5, y: 0.5 };

// Quality tiers (distance in pixels)
export const ACCURACY_THRESHOLDS = [
  { maxDistance: 60, quality: "Excellent", minScore: 90 },
  { maxDistance: 120, quality: "Good", minScore: 75 },
  { maxDistance: 200, quality: "Fair", minScore: 60 }
];

// Converts normalized center {0.5, 0.5} into pixel coordinates
function getCenterTarget(viewport) {
  const width = viewport?.width ?? window.innerWidth;
  const height = viewport?.height ?? window.innerHeight;

  return {
    x: CENTER_TARGET.x * width,
    y: CENTER_TARGET.y * height
  };
}

// Returns an instant accuracy reading using ONE prediction.
// If prediction is missing or invalid: default to "Fair".
export function measureInstantAccuracy(getPrediction, viewport) {
  if (typeof getPrediction !== "function") {
    return { score: 0, quality: "Unknown", avgDistance: null };
  }

  // Try up to 2–3 prediction reads, instantly
  let prediction = getPrediction();
  if (!isValidPrediction(prediction)) {
    prediction = getPrediction();
  }
  if (!isValidPrediction(prediction)) {
    // Can't get a valid prediction — default fallback
    return {
      score: 101,
      quality: "Can't get a valid prediction",
      avgDistance: null
    };
  }

  const center = getCenterTarget(viewport);
  const dx = prediction.x - center.x;
  const dy = prediction.y - center.y;

  const distance = Math.sqrt(dx * dx + dy * dy);

  return computeScore(distance);
}

// Check if prediction has valid numeric x/y
function isValidPrediction(pred) {
  return pred
    && Number.isFinite(pred.x)
    && Number.isFinite(pred.y);
}

// Convert one distance into score + quality
function computeScore(distance) {
  // Map 0–200px into 100 → 0
  const normalizedScore = Math.max(0, 100 - (distance / 200) * 100);

  const tier =
    ACCURACY_THRESHOLDS.find(th => distance <= th.maxDistance) ?? null;

  return {
    score: Math.round(normalizedScore),
    quality: tier?.quality ?? "Poor",
    avgDistance: distance
  };
}
