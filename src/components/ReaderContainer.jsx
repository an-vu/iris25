// src/components/ReaderContainer.jsx
import ReaderView from "./ReaderView.jsx";
import "../styles/ButtonGaze.css";
import "../styles/ReaderContainer.css";

export default function ReaderContainer() {
  return (
    <div className="reader-container">
      {/* Left: Reader View */}
      <ReaderView />

      {/* Right: Gaze Controls */}
      <div className="gaze-controls">
        <button className="gaze-button up">
          <svg
            width="100%" height="100%" viewBox="0 0 24 24"
            fill="none" xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16 12L12 8M12 8L8 12M12 8V16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
              stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
        </button>

        <button className="gaze-button down">
          <svg
            width="100%" height="100%" viewBox="0 0 24 24"
            fill="none" xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 12L12 16M12 16L16 12M12 16V8M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
              stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}