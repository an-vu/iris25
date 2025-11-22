export default function ReaderGazeZoneOverlay({ isTop, isBottom }) {
  return (
    <div className="gaze-zone-overlay overlay-reader">
      <div className={`zone top-zone${isTop ? " active" : ""}`} />
      <div className={`zone bottom-zone${isBottom ? " active" : ""}`} />
    </div>
  );
}
