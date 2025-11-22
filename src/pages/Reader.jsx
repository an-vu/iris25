import { useEffect } from "react";
import { useParams } from "react-router-dom";

import { books } from "../data/books.js";
import {
  NavbarReader,
  ReaderContainer,
  ReaderTitle,
  ZoomScaleObserver,
  ReaderGazeZoneOverlay,
  ReaderScrollButtons,
} from "../components";
import { useChapterNavigation } from "../hooks/useChapterNavigation.js";
import { useZoomControls } from "../hooks/useZoomControls.js";
import NotFound from "./NotFound";

const FALLBACK_FILES = ["/iris25/books/test.pdf"];

export default function Reader() {
  const { bookId } = useParams();
  const bookIndex = Number(bookId);
  const currentBook = Number.isInteger(bookIndex) ? books[bookIndex] : null;

  if (!currentBook) {
    return <NotFound />;
  }

  const files =
    currentBook.files && currentBook.files.length > 0
      ? currentBook.files
      : FALLBACK_FILES;

  const {
    currentFile,
    currentIndex,
    handleNext,
    handlePrevious,
    disableNext,
    disablePrevious,
  } = useChapterNavigation(files);

  const {
    zoomPluginInstance,
    handleZoomIn,
    handleZoomOut,
    disableZoomIn,
    disableZoomOut,
    handleScaleChange,
  } = useZoomControls();

  useEffect(() => {
    console.log(`Loaded Reader for book ID: ${bookId}, chapter ${currentIndex}`);
  }, [bookId, currentIndex]);

  return (
    <div className="reader background">
      <div className="master-container">
        <ReaderTitle
          title={currentBook.title}
          subtitle={`by ${currentBook.author}`}
        />

      <ReaderContainer
        filePath={currentFile}
        zoomPluginInstance={zoomPluginInstance}
        renderOverlay={({ isTop, isBottom }) => (
          <ReaderGazeZoneOverlay isTop={isTop} isBottom={isBottom} />
        )}
        renderControls={({ onScrollUp, onScrollDown, isTop, isBottom }) => (
          <ReaderScrollButtons
            onScrollUp={onScrollUp}
            onScrollDown={onScrollDown}
            isTopActive={isTop}
            isBottomActive={isBottom}
          />
        )}
      />

        <ZoomScaleObserver
          pluginInstance={zoomPluginInstance}
          onScaleChange={handleScaleChange}
        />

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
