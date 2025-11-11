import { useEffect, useState } from "react";

export default function useWebGazer() {
  const [gaze, setGaze] = useState({ x: null, y: null });

  useEffect(() => {
    const loadWebGazer = async () => {
      if (!window.webgazer) {
        await import("webgazer");
      }

      window.webgazer
        .setRegression("ridge")
        .setGazeListener((data, elapsedTime) => {
          if (data) {
            setGaze({ x: data.x, y: data.y });
          }
        })
        .begin();

      // disable the debug video feedback for cleaner UI
      window.webgazer.showVideo(false);
      window.webgazer.showFaceOverlay(false);
      window.webgazer.showPredictionPoints(false);
    };

    loadWebGazer();

    return () => {
      if (window.webgazer) {
        window.webgazer.end();
      }
    };
  }, []);

  return gaze;
}