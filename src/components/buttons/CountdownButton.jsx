import CheckBadgeIcon from "./CheckBadgeIcon.jsx";

export default function CountdownButton({
  complete,
  disabled,
  value,
  onStart,
  active,
}) {
  const className = [
    "calibration-click",
    complete ? "is-complete" : "calibration-click--accuracy",
  ]
    .filter(Boolean)
    .join(" ");

  const handleClick = () => {
    if (disabled || complete || active) return;
    onStart?.();
  };

  const label = complete ? <CheckBadgeIcon aria-hidden="true" /> : value;

  return (
    <button
      type="button"
      className={className}
      disabled={disabled}
      onClick={handleClick}
      aria-label={
        complete
          ? "Focus complete"
          : active
          ? `Hold steady, ${value} seconds`
          : "Start 5-second focus"
      }
    >
      {label}
    </button>
  );
}
