import "../styles/ButtonGaze.css";

const noop = () => {};

export default function GazeControls({
    onScrollUp = noop,
    onScrollDown = noop,
}) {
    return (
        <div className="gaze-controls">
            {/* Scroll Up */}
            <button
                className="gaze-button up"
                title="Scroll Up"
                onClick={onScrollUp}
                type="button"
            >
                <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
                    <path
                        d="M16 12L12 8L8 12M12 8V16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>

            {/* Scroll Down */}
            <button
                className="gaze-button down"
                title="Scroll Down"
                onClick={onScrollDown}
                type="button"
            >
                <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
                    <path
                        d="M8 12L12 16L16 12M12 16V8M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>
        </div>
    );
}
