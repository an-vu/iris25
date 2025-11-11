// src/components/ReaderContainer.jsx
import ReaderView from "./ReaderView.jsx";
import "../styles/ButtonGaze.css";
import "../styles/ReaderContainer.css";

export default function ReaderContainer({ filePath, zoomPluginInstance }) {
  return (
    <div className="reader-container">
      {/* Reader View */}
      <ReaderView filePath={filePath} zoomPluginInstance={zoomPluginInstance} />

      {/* Gaze Controls (for future eye-tracking scroll) */}
      <div className="gaze-controls">
        <button className="gaze-button up" title="Scroll Up">
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

        <button className="gaze-button down" title="Scroll Down">
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
    </div>
  );
}
