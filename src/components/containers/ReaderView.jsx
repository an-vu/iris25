import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

export default function ReaderView({
  filePath,
  zoomPluginInstance,
  scrollContainerRef,
}) {
  return (
    <div className="reader-view">
      <div className="pdf-placeholder" ref={scrollContainerRef}>
        <Worker workerUrl="/iris25/libs/pdf.worker.min.js">
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
