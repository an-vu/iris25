import {
  ReaderContainer,
  NavbarReader,
  ReaderTitle,
  ZoomScaleObserver,
} from "../components";
import { useChapterNavigation } from "../hooks/useChapterNavigation.js";
import { useZoomControls } from "../hooks/useZoomControls.js";

export default function NotFound() {
  const {
    currentFile,
    handleNext,
    handlePrevious,
    disableNext,
    disablePrevious,
  } = useChapterNavigation(["/iris25/books/test.pdf"]);

  const {
    zoomPluginInstance,
    handleZoomIn,
    handleZoomOut,
    disableZoomIn,
    disableZoomOut,
    handleScaleChange,
  } = useZoomControls();

  return (
    <div className="reader background">
      <div className="master-container">
        {/* Title Section */}
        <ReaderTitle
          title="404 💔 You Got Lost?"
          subtitle="Shrek, Take the Wheel"
        />

        {/* Reader Area — reuse ReaderContainer but pass test.pdf */}
        <ReaderContainer
          filePath={currentFile}
          zoomPluginInstance={zoomPluginInstance}
        />

        <ZoomScaleObserver
          pluginInstance={zoomPluginInstance}
          onScaleChange={handleScaleChange}
        />

        {/* Bottom Navbar */}
        <NavbarReader
          onNext={handleNext}
          onPrevious={handlePrevious}
          disableNext={disableNext}
          disablePrevious={disablePrevious}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          disableZoomIn={disableZoomIn}
          disableZoomOut={disableZoomOut}
        />
      </div>
    </div>
  );
}
