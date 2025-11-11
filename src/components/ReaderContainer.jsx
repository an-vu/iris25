// src/components/ReaderContainer.jsx
import ReaderView from "./ReaderView.jsx";
import GazeControls from "./GazeControls.jsx";
import "../styles/ReaderContainer.css";

export default function ReaderContainer({ filePath, zoomPluginInstance }) {
  return (
    <div className="reader-container">
      <ReaderView filePath={filePath} zoomPluginInstance={zoomPluginInstance} />
      <GazeControls />
    </div>
  );
}
