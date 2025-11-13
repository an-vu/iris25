// src/pages/Reader.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import { zoomPlugin } from "@react-pdf-viewer/zoom";
import { books } from "../data/books.js";

import { NavbarReader, ReaderContainer } from "../components";

// Zoom configuration shared by the toolbar controls and animation helpers.
const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4, 5];
const MIN_ZOOM = ZOOM_LEVELS[0];
const MAX_ZOOM = ZOOM_LEVELS[ZOOM_LEVELS.length - 1];
const ZOOM_ANIMATION_DURATION = 220;
const FALLBACK_STEP = 0.25;

// Reader renders the PDF viewer page and wires up zoom + navigation handlers.
export default function Reader() {
  const { bookId } = useParams();
  const currentBook = books[bookId] || {};
  const files = currentBook.files || ["/iris25/books/test.pdf"];
  const [currentIndex, setCurrentIndex] = useState(0);
  const zoomPluginInstance = zoomPlugin();
  const [currentScale, setCurrentScale] = useState(1);
  const scaleRef = useRef(1);
  const animationFrameRef = useRef(null);

  const handleScaleChange = useCallback((scale) => {
    scaleRef.current = scale;
    setCurrentScale(scale);
  }, []);

  const cancelZoomAnimation = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // next/previous chapter controls
  const handleNext = () => {
    if (currentIndex < files.length - 1) setCurrentIndex((i) => i + 1);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  // Smoothly tween to the target zoom level so jumps feel less jarring.
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
        const eased = easeOutCubic(progress);
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

  const handleZoomIn = useCallback(() => {
    const nextScale = getNextScale(scaleRef.current);
    animateZoomTo(nextScale);
  }, [animateZoomTo]);

  const handleZoomOut = useCallback(() => {
    const previousScale = getPreviousScale(scaleRef.current);
    animateZoomTo(previousScale);
  }, [animateZoomTo]);

  useEffect(() => {
    console.log(`Loaded Reader for book ID: ${bookId}, chapter ${currentIndex}`);
  }, [bookId, currentIndex]);

  // Abort any in-flight animations when the component unmounts or handlers change.
  useEffect(() => cancelZoomAnimation, [cancelZoomAnimation]);

  const disableZoomIn = currentScale >= MAX_ZOOM - 0.001;
  const disableZoomOut = currentScale <= MIN_ZOOM + 0.001;

  return (
    <div className="reader background">
      <div className="master-container">
        {/* Title Section */}
        <div className="title-container">
          <h4 className="title">{currentBook.title}</h4>
          <h4 className="author">{currentBook.author}</h4>
        </div>

        {/* Reader Area */}
        <ReaderContainer
          filePath={files[currentIndex]}
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

function getNextScale(scale) {
  const nextPreset = ZOOM_LEVELS.find((level) => level > scale + 0.001);
  if (nextPreset) return nextPreset;
  return Math.min(MAX_ZOOM, +(scale + FALLBACK_STEP).toFixed(2));
}

function getPreviousScale(scale) {
  for (let i = ZOOM_LEVELS.length - 1; i >= 0; i -= 1) {
    if (ZOOM_LEVELS[i] < scale - 0.001) return ZOOM_LEVELS[i];
  }
  return Math.max(MIN_ZOOM, +(scale - FALLBACK_STEP).toFixed(2));
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

// Subscribes to zoom plugin scale updates and forwards them to React state.
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

// Bridge component so we can run a React effect whenever the plugin scale changes.
function ScaleEffect({ scale, onScaleChange }) {
  useEffect(() => {
    onScaleChange(scale);
  }, [scale, onScaleChange]);
  return null;
}
