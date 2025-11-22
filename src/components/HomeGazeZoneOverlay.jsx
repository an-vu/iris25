export default function HomeGazeZoneOverlay({
  isLeft,
  isCenter,
  isRight,
  centerZoneRef,
  centerZoneStyle
}) {
  return (
    <div className="gaze-zone-overlay overlay-home">
      <div className={`zone left-zone${isLeft ? " active" : ""}`} />

      <div
        ref={centerZoneRef}
        className={`zone center-zone${isCenter ? " active" : ""}`}
        style={
          centerZoneStyle
            ? {
                ...centerZoneStyle,
                position: "absolute",
                flex: "0 0 auto",
                transform: "none",
              }
            : undefined
        }
      />

      <div className={`zone right-zone${isRight ? " active" : ""}`} />
    </div>
  );
}
