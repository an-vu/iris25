import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const EDGE_OFFSET_PX = 50;     // Keep targets away from screen edges
const REQUIRED_CLICKS = 5;     // Clicks per calibration point

// Normalized calibration points around the screen.
// 0 = left/top, 1 = right/bottom.
// Order defines the sequence the user must click.
const RELATIVE_POSITIONS = [
  { x: 0, y: 0 },   // top-left
  { x: 0.5, y: 0 },   // top-center
  { x: 1, y: 0 },   // top-right
  { x: 1, y: 0.5 }, // mid-right
  { x: 1, y: 1 },   // bottom-right
  { x: 0.5, y: 1 },   // bottom-center
  { x: 0, y: 1 },   // bottom-left
  { x: 0, y: 0.5 }, // mid-left
  { x: 0.5, y: 0.5 }, // center (final target)
];

// Convert normalized positions into absolute px values.
// Clamped using EDGE_OFFSET_PX so targets never spawn at extreme edges.
function computeAbsolutePositions() {
  if (typeof window === "undefined") return [];

  const w = window.innerWidth;
  const h = window.innerHeight;

  return RELATIVE_POSITIONS.map(({ x, y }) => ({
    left: Math.min(Math.max(x * w, EDGE_OFFSET_PX), w - EDGE_OFFSET_PX),
    top: Math.min(Math.max(y * h, EDGE_OFFSET_PX), h - EDGE_OFFSET_PX),
  }));
}

export default function CalibrationStep2({ onComplete, showHud = true }) {
  // Absolute px coordinates for every calibration target
  const [positions, setPositions] = useState(() => computeAbsolutePositions());

  // Which target the user is currently on (0 to n-1)
  const [pointIndex, setPointIndex] = useState(0);

  // How many clicks are left for the current target
  const [clicksLeft, setClicksLeft] = useState(REQUIRED_CLICKS);

  // True once the final target is completed
  const [done, setDone] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);

  // Recompute positions on window resize for responsive layouts
  useEffect(() => {
    const handleResize = () => setPositions(computeAbsolutePositions());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Dynamic color feedback as user progresses at each point
  const colorSteps = ["blue", "cyan", "teal", "mint", "green"];
  const clicksTaken = REQUIRED_CLICKS - Math.max(clicksLeft, 0);
  const progressIndex = Math.min(colorSteps.length - 1, Math.max(0, clicksTaken));
  const colorClass = `calibration-click--${colorSteps[progressIndex]}`;

  // Main click handler that drives step progression
  const handleClick = async () => {
    if (done || isWaiting) return;

    setIsWaiting(true);
    // await new Promise(resolve => setTimeout(resolve, 350));

    // Still clicking the current target
    if (clicksLeft > 1) {
      setClicksLeft(prev => prev - 1);
      setIsWaiting(false);
      return;
    }

    // Finished this point, move to the next one
    if (pointIndex < positions.length - 1) {
      setPointIndex(prev => prev + 1);
      setClicksLeft(REQUIRED_CLICKS);
      setIsWaiting(false);
      return;
    }

    // Finished the final target
    setDone(true);
    onComplete?.();
    setIsWaiting(false);
  };

  // SSR / fallback guard
  if (typeof document === "undefined" || positions.length === 0) return null;

  // Current target coordinates
  const target = positions[pointIndex] ?? positions[0];

  return createPortal(
    <div className="calibration-overlay calibration-overlay--blocking">
      {/* Moving calibration target */}
      <button
        type="button"
        className={[
          "calibration-click",
          colorClass,
          done ? "is-complete" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ left: `${target.left}px`, top: `${target.top}px` }}
        onClick={handleClick}
        disabled={done || isWaiting}
      >
        {done ? "✓" : clicksLeft}
      </button>

      {/* Mini HUD showing progress */}
      {showHud && (
        <div className="calibration-hud-mini">
          <span className="calibration-card__eyebrow" style={{ margin: 0 }}>
            Point {Math.min(pointIndex + 1, positions.length)} / {positions.length} •{" "}
            {done ? "Complete" : `${clicksLeft} clicks left`}
          </span>
        </div>
      )}
    </div>,
    document.body
  );
}
