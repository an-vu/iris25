const COLOR_SEQUENCE = [
  "calibration-click--red",
  "calibration-click--orange",
  "calibration-click--yellow",
  "calibration-click--lightgreen",
  "calibration-click--green",
];

export default function NinePointButton({
  complete,
  disabled,
  clicksRemaining,
  totalClicks = COLOR_SEQUENCE.length,
  onClick,
}) {
  const clicksTaken = Math.max(0, totalClicks - clicksRemaining);
  const colorClass = complete
    ? "calibration-click is-complete"
    : `calibration-click ${COLOR_SEQUENCE[Math.min(clicksTaken, COLOR_SEQUENCE.length - 1)]}`;

  const handleClick = () => {
    if (disabled || complete) return;
    onClick?.();
  };

  return (
      <div className="calibration-step__indicator-button">
        <button
          type="button"
          className={colorClass}
          disabled={disabled || complete}
          onClick={handleClick}
          aria-label={
            complete
              ? "Practice complete"
              : `Practice target, ${clicksRemaining} clicks remaining`
          }
        >
          {complete ? "✓" : clicksRemaining}
        </button>
    </div>
  );
}
