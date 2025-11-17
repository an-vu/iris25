import { useEffect } from "react";

export default function ZoomScaleObserver({ pluginInstance, onScaleChange }) {
  if (!pluginInstance?.CurrentScale) return null;
  const CurrentScale = pluginInstance.CurrentScale;

  return (
    <CurrentScale>
      {({ scale }) => (
        <ScaleEffect scale={scale} onScaleChange={onScaleChange} />
      )}
    </CurrentScale>
  );
}

function ScaleEffect({ scale, onScaleChange }) {
  useEffect(() => {
    onScaleChange(scale);
  }, [scale, onScaleChange]);

  return null;
}
