import { useCallback, useRef, useState } from "react";
import { ACCURACY_DURATION_MS, ACCURACY_THRESHOLD_PX, getAccuracyTier } from "../utils/calibrationConfig.js";

export function useCalibrationAccuracy({
  rawGazeRef,
  durationMs = ACCURACY_DURATION_MS,
  thresholdPx = ACCURACY_THRESHOLD_PX,
  onTestStart,
  onTestComplete,
} = {}) {
  const timerRef = useRef(null);
  const samplesRef = useRef([]);
  const [isAccuracyPhase, setIsAccuracyPhase] = useState(false);
  const [accuracyTimeLeft, setAccuracyTimeLeft] = useState(0);
  const [accuracyScore, setAccuracyScore] = useState(null);
  const [accuracyQuality, setAccuracyQuality] = useState(null);
  const [showAccuracyModal, setShowAccuracyModal] = useState(false);
  const [showAccuracyPrompt, setShowAccuracyPrompt] = useState(false);

  const clearAccuracyState = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    samplesRef.current = [];
    setAccuracyTimeLeft(0);
    setAccuracyScore(null);
    setAccuracyQuality(null);
    setShowAccuracyModal(false);
    setShowAccuracyPrompt(false);
    setIsAccuracyPhase(false);
  }, []);

  const startAccuracyTest = useCallback(() => {
    if (typeof window === "undefined") return;
    setIsAccuracyPhase(true);
    setShowAccuracyModal(false);
    setAccuracyTimeLeft(durationMs);
    samplesRef.current = [];
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    onTestStart?.();
    const startedAt = performance.now();
    timerRef.current = window.setInterval(() => {
      const now = performance.now();
      const elapsed = now - startedAt;
      setAccuracyTimeLeft(Math.max(0, durationMs - elapsed));
      const sample = rawGazeRef?.current;
      if (sample && sample.x != null && sample.y != null) {
        samplesRef.current.push({ x: sample.x, y: sample.y });
      }
      if (elapsed >= durationMs) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
        const samples = samplesRef.current.slice();
        const centerX = window.innerWidth * 0.5;
        const centerY = window.innerHeight * 0.5;
        const avgDistance =
          samples.length === 0
            ? thresholdPx
            : samples.reduce(
                (sum, point) => sum + Math.hypot(point.x - centerX, point.y - centerY),
                0
              ) / samples.length;
        const ratio = Math.max(0, 1 - avgDistance / thresholdPx);
        const score = Math.round(ratio * 100);
        const quality = getAccuracyTier(score);
        setAccuracyScore(score);
        setAccuracyQuality(quality);
        setIsAccuracyPhase(false);
        setShowAccuracyModal(true);
        onTestComplete?.({ score, quality });
      }
    }, 60);
  }, [durationMs, onTestComplete, onTestStart, rawGazeRef, thresholdPx]);

  const confirmAccuracyPrompt = useCallback(() => {
    setShowAccuracyPrompt(false);
    startAccuracyTest();
  }, [startAccuracyTest]);

  const dismissAccuracyModal = useCallback(() => {
    setShowAccuracyModal(false);
  }, []);

  return {
    isAccuracyPhase,
    accuracyTimeLeft,
    accuracyScore,
    accuracyQuality,
    showAccuracyModal,
    showAccuracyPrompt,
    setShowAccuracyPrompt,
    clearAccuracyState,
    startAccuracyTest,
    confirmAccuracyPrompt,
    dismissAccuracyModal,
  };
}
