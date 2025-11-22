export default function NavArrow({ direction, active, onClick }) {
  const isLeft = direction === "left";
  const baseClass = `nav-button svg-button scroll-button ${direction}`;
  const activeClass = active ? " gaze-active" : "";

  return (
    <button className={baseClass + activeClass} onClick={onClick}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {isLeft ? (
          <path
            d="M15 18L9 12L15 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M9 18L15 12L9 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </button>
  );
}
