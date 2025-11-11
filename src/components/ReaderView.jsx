import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "../styles/ReaderContainer.css";

export default function ReaderView({ filePath, zoomPluginInstance }) {
  return (
    <div className="reader-view">
      <div className="pdf-placeholder">
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Viewer
            fileUrl={filePath}
            theme="light"
            plugins={zoomPluginInstance ? [zoomPluginInstance] : []}
          />
        </Worker>
      </div>
    </div>
  );
}
