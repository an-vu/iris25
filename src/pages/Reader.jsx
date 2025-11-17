// src/pages/Reader.jsx

import { useParams } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import { zoomPlugin } from "@react-pdf-viewer/zoom";
import { books } from "../data/books.js";

import { NavbarReader, ReaderContainer } from "../components";
import NotFound from "./NotFound";

// Preset zoom levels used by toolbar, shortcuts, and smooth zoom animation.
// MIN_ZOOM and MAX_ZOOM cap the allowed range.
const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4, 5];
const MIN_ZOOM = ZOOM_LEVELS[0];
const MAX_ZOOM = ZOOM_LEVELS[ZOOM_LEVELS.length - 1];
const ZOOM_ANIMATION_DURATION = 220; // ms for smooth zoom transitions
const FALLBACK_STEP = 0.25; // Used when scale is between preset levels

// Main PDF reader page. Loads book by ID, handles zoom, chapter switching, and layout.
export default function Reader() {
  const { bookId } = useParams();
  const bookIndex = Number(bookId);

  // Validate book index
  const currentBook = Number.isInteger(bookIndex) ? books[bookIndex] : null;
  if (!currentBook) return <NotFound />;

  // If book has multiple files, treat them as chapters. Else, fallback to default test PDF.
  const files = currentBook.files?.length
    ? currentBook.files
    : ["/iris25/books/test.pdf"];

  const [currentIndex, setCurrentIndex] = useState(0); // chapter index
  const zoomPluginInstance = zoomPlugin();

  // React state for scale, plus a stable ref so animation can read without triggering rerenders.
  const [currentScale, setCurrentScale] = useState(1);
  const scaleRef = useRef(1);

  // Holds the current animation frame ID so we can cancel it.
  const animationFrameRef = useRef(null);

  // Sync plugin scale -> React scale + ref
  const handleScaleChange = useCallback((scale) => {
    scaleRef.current = scale;
    setCurrentScale(scale);
  }, []);

  // Cancel any ongoing zoom animation
  const cancelZoomAnimation = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // --- Chapter navigation ---
  const handleNext = () => {
    if (currentIndex < files.length - 1) setCurrentIndex((i) => i + 1);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  // Smooth zoom animation. Interpolates between current scale and target scale.
  const animateZoomTo = useCallback(
    (targetScale) => {
      const zoomTo = zoomPluginInstance?.zoomTo;
      if (!zoomTo) return;

      const startScale = scaleRef.current;
      if (Math.abs(targetScale - startScale) < 0.001) return;

      cancelZoomAnimation();
      let startTime;

      const step = (timestamp) => {
        if (startTime === undefined) startTime = timestamp;

        const progress = Math.min(
          (timestamp - startTime) / ZOOM_ANIMATION_DURATION,
          1
        );

        const eased = easeOutCubic(progress); // smoother than linear
        const nextScale = startScale + (targetScale - startScale) * eased;

        zoomTo(nextScale);

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(step);
        } else {
          animationFrameRef.current = null;
        }
      };

      animationFrameRef.current = requestAnimationFrame(step);
    },
    [zoomPluginInstance, cancelZoomAnimation]
  );

  // Zoom buttons -> pick next preset scale
  const handleZoomIn = useCallback(() => {
    const nextScale = getNextScale(scaleRef.current);
    animateZoomTo(nextScale);
  }, [animateZoomTo]);

  const handleZoomOut = useCallback(() => {
    const prevScale = getPreviousScale(scaleRef.current);
    animateZoomTo(prevScale);
  }, [animateZoomTo]);

  // Debug log
  useEffect(() => {
    console.log(`Loaded Reader for book ID: ${bookId}, chapter ${currentIndex}`);
  }, [bookId, currentIndex]);

  // Cleanup animation if component unmounts or dependencies change
  useEffect(() => cancelZoomAnimation, [cancelZoomAnimation]);

  // Disable zoom buttons at limits
  const disableZoomIn = currentScale >= MAX_ZOOM - 0.001;
  const disableZoomOut = currentScale <= MIN_ZOOM + 0.001;

  return (
    <div className="reader background">
      <div className="master-container">

        {/* Book title + author */}
        <div className="title-container">
          <h4 className="title">{currentBook.title}</h4>
          <h4 className="author">by {currentBook.author}</h4>
        </div>

        {/* PDF viewer */}
        <ReaderContainer
          filePath={files[currentIndex]}
          zoomPluginInstance={zoomPluginInstance}
        />

        {/* Listen for scale changes from the plugin */}
        <ZoomScaleObserver
          pluginInstance={zoomPluginInstance}
          onScaleChange={handleScaleChange}
        />

        {/* Navigation + zoom controls */}
        <NavbarReader
          onNext={handleNext}
          onPrevious={handlePrevious}
          disableNext={currentIndex === files.length - 1}
          disablePrevious={currentIndex === 0}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          disableZoomIn={disableZoomIn}
          disableZoomOut={disableZoomOut}
        />
      </div>
    </div>
  );
}

// Pick next preset zoom level, or bump by fallback
function getNextScale(scale) {
  const nextPreset = ZOOM_LEVELS.find((level) => level > scale + 0.001);
  if (nextPreset) return nextPreset;
  return Math.min(MAX_ZOOM, +(scale + FALLBACK_STEP).toFixed(2));
}

// Pick previous preset zoom level, or fallback down
function getPreviousScale(scale) {
  for (let i = ZOOM_LEVELS.length - 1; i >= 0; i -= 1) {
    if (ZOOM_LEVELS[i] < scale - 0.001) return ZOOM_LEVELS[i];
  }
  return Math.max(MIN_ZOOM, +(scale - FALLBACK_STEP).toFixed(2));
}

// Easing curve to make zoom animation decelerate at end
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

// Subscribe to @react-pdf-viewer zoom plugin updates
function ZoomScaleObserver({ pluginInstance, onScaleChange }) {
  if (!pluginInstance?.CurrentScale) return null;
  const CurrentScale = pluginInstance.CurrentScale;

  return (
    <CurrentScale>
      {({ scale }) => (
        <ScaleEffect scale={scale} onScaleChange={onScaleChange} />
      )}
    </CurrentScale>
  );
}

// Convert plugin scale updates into React state updates
function ScaleEffect({ scale, onScaleChange }) {
  useEffect(() => {
    onScaleChange(scale);
  }, [scale, onScaleChange]);

  return null;
}
