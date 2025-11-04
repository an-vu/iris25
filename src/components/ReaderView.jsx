import { useState } from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "../styles/ReaderContainer.css";
import { useLocation } from "react-router-dom";

export default function ReaderView() {
  const location = useLocation();
  const files = location.state?.files || ["/iris25/books/test.pdf"];
  const [currentIndex, setCurrentIndex] = useState(0);

  const filePath = files[currentIndex];

  const handleNext = () => {
    if (currentIndex < files.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  return (
    <div className="reader-view">
      <div className="pdf-placeholder">
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Viewer fileUrl={filePath} theme="light" />
        </Worker>
      </div>

      {files.length > 1 && (
        <div className="reader-nav-controls">
          <button disabled={currentIndex === 0} onClick={handlePrevious}>
            Previous Chapter
          </button>
          <button disabled={currentIndex === files.length - 1} onClick={handleNext}>
            Next Chapter
          </button>
        </div>
      )}
    </div>
  );
}