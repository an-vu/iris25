import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CalibrationOverlay from "../components/CalibrationOverlay.jsx";
import NavbarReader from "../components/NavbarReader.jsx";
import {
  CALIBRATION_POSITIONS,
  POSITION_STYLES,
} from "../utils/webgazerCalibrate.js";
import "../styles/Reader.css";
import "../styles/MasterContainer.css";
import "../styles/Navbar.css";
import "../styles/ButtonNavbar.css";
import "../styles/ReaderTitle.css";
import "../styles/ReaderContainer.css";
import "../styles/CalibrationLab.css";

const STEP_DURATION_SECONDS = 10;
const MOCK_TOTAL_CHAPTERS = 5;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.25;

export default function CalibrationLab() {
  const totalSteps = CALIBRATION_POSITIONS.length;
  const [step, setStep] = useState(0);
  const [countdown, setCountdown] = useState(STEP_DURATION_SECONDS);
  const [message, setMessage] = useState(CALIBRATION_POSITIONS[0].label);
  const [isOverlayVisible, setOverlayVisible] = useState(true);
  const [isSessionActive, setSessionActive] = useState(false);
  const [mockChapter, setMockChapter] = useState(1);
  const [mockZoom, setMockZoom] = useState(1);
  const videoRef = useRef(null);

  const currentPosition = useMemo(
    () =>
      step >= 0 && step < totalSteps
        ? CALIBRATION_POSITIONS[step]
        : CALIBRATION_POSITIONS[0],
    [step, totalSteps]
  );

  const currentStyle =
    POSITION_STYLES[currentPosition.id] || POSITION_STYLES.center;

  const overlayStep = isOverlayVisible ? step : -1;

  useEffect(() => {
    if (step < 0 || step >= totalSteps) return;
    setMessage(CALIBRATION_POSITIONS[step].label);
    setCountdown(STEP_DURATION_SECONDS);
  }, [step, totalSteps]);

  useEffect(() => {
    if (!isSessionActive) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setStep((current) => {
            const next = current + 1;
            if (next >= totalSteps) {
              setSessionActive(false);
              return current;
            }
            return next;
          });
          return STEP_DURATION_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isSessionActive, totalSteps]);

  const handleStartSession = useCallback(() => {
    setOverlayVisible(true);
    setSessionActive(true);
    setStep(0);
  }, []);

  const handleStopSession = useCallback(() => {
    setSessionActive(false);
    setCountdown(STEP_DURATION_SECONDS);
  }, []);

  const handleNextStep = useCallback(() => {
    setSessionActive(false);
    setStep((prev) => Math.min(prev + 1, totalSteps - 1));
  }, [totalSteps]);

  const handlePrevStep = useCallback(() => {
    setSessionActive(false);
    setStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleStepSlider = useCallback((event) => {
    setSessionActive(false);
    setOverlayVisible(true);
    setStep(Number(event.target.value));
  }, []);

  const toggleOverlay = useCallback(() => {
    setOverlayVisible((prev) => !prev);
  }, []);

  const handleMockNext = useCallback(() => {
    setMockChapter((prev) => Math.min(prev + 1, MOCK_TOTAL_CHAPTERS));
  }, []);

  const handleMockPrevious = useCallback(() => {
    setMockChapter((prev) => Math.max(prev - 1, 1));
  }, []);

  const handleMockZoomIn = useCallback(() => {
    setMockZoom((prev) => Math.min(MAX_ZOOM, +(prev + ZOOM_STEP).toFixed(2)));
  }, []);

  const handleMockZoomOut = useCallback(() => {
    setMockZoom((prev) => Math.max(MIN_ZOOM, +(prev - ZOOM_STEP).toFixed(2)));
  }, []);

  const disableNext = mockChapter === MOCK_TOTAL_CHAPTERS;
  const disablePrevious = mockChapter === 1;
  const disableZoomIn = mockZoom >= MAX_ZOOM - 0.001;
  const disableZoomOut = mockZoom <= MIN_ZOOM + 0.001;

  return (
    <div className="reader background calibration-lab">
      <div className="master-container">
        <div className="title-container">
          <h4 className="title">Calibration Lab</h4>
          <h4 className="author">Design sandbox for overlay iteration</h4>
        </div>

        <div className="reader-container calibration-lab__shell">
          <div className="calibration-lab__left">
            <section className="calibration-card calibration-lab__overview">
              <h2>Overlay Preview Context</h2>
              <p>
                Evaluate copy, countdown pacing, and calibration placement while
                seeing the reader chrome in place. Use the navbar to simulate
                chapter and zoom changes as you iterate.
              </p>

              <div className="calibration-lab__mock-state">
                <div className="mock-pill">
                  <span>Mock Chapter</span>
                  <strong>
                    {mockChapter} / {MOCK_TOTAL_CHAPTERS}
                  </strong>
                </div>
                <div className="mock-pill">
                  <span>Mock Zoom</span>
                  <strong>{mockZoom.toFixed(2)}x</strong>
                </div>
                <div className="mock-pill">
                  <span>Overlay</span>
                  <strong>{isOverlayVisible ? "Visible" : "Hidden"}</strong>
                </div>
              </div>
            </section>

            <section className="calibration-card">
              <h2>Design Notes</h2>
              <p>
                Keep the overlay copy concise so users can focus on the
                highlighted waypoint. Each step currently runs on a{" "}
                {STEP_DURATION_SECONDS}-second timer, but you can pause the
                session to fine-tune text or positioning.
              </p>
              <ul>
                <li>Countdown auto-advances through the calibration points.</li>
                <li>
                  Use the slider to jump to specific locations (top-left, center,
                  etc.).
                </li>
                <li>
                  Toggle the overlay to evaluate layout interactions with the rest
                  of the page.
                </li>
                <li>
                  Update the instruction text area to preview typography and line
                  breaks.
                </li>
              </ul>
            </section>
          </div>

          <div className="calibration-lab__right">
            <section className="calibration-card">
              <h2>Playback Controls</h2>

              <div className="calibration-status">
                <div className="status-pill">
                  <h3>Step</h3>
                  <p>
                    {overlayStep >= 0 ? overlayStep + 1 : "-"} / {totalSteps}
                  </p>
                </div>
                <div className="status-pill">
                  <h3>Countdown</h3>
                  <p>{overlayStep >= 0 ? `${countdown}s` : "--"}</p>
                </div>
                <div className="status-pill">
                  <h3>Overlay</h3>
                  <p>{isOverlayVisible ? "Visible" : "Hidden"}</p>
                </div>
              </div>

              <div className="calibration-controls">
                <div>
                  <label htmlFor="step-slider">Calibration Step</label>
                  <input
                    id="step-slider"
                    type="range"
                    min="0"
                    max={totalSteps - 1}
                    value={Math.max(0, Math.min(step, totalSteps - 1))}
                    onChange={handleStepSlider}
                  />
                </div>

                <div>
                  <label htmlFor="message">Instruction Copy</label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                  />
                </div>

                <div className="calibration-buttons">
                  <button className="btn-primary" type="button" onClick={handleStartSession}>
                    Start Guided Session
                  </button>
                  <button className="btn-secondary" type="button" onClick={handlePrevStep}>
                    Previous Step
                  </button>
                  <button className="btn-secondary" type="button" onClick={handleNextStep}>
                    Next Step
                  </button>
                  <button className="btn-secondary" type="button" onClick={toggleOverlay}>
                    {isOverlayVisible ? "Hide Overlay" : "Show Overlay"}
                  </button>
                  <button className="btn-danger" type="button" onClick={handleStopSession}>
                    Stop Session
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>

        <NavbarReader
          onNext={handleMockNext}
          onPrevious={handleMockPrevious}
          disableNext={disableNext}
          disablePrevious={disablePrevious}
          onZoomIn={handleMockZoomIn}
          onZoomOut={handleMockZoomOut}
          disableZoomIn={disableZoomIn}
          disableZoomOut={disableZoomOut}
        />
      </div>

      <CalibrationOverlay
        step={overlayStep}
        totalSteps={totalSteps}
        countdown={countdown}
        message={message}
        positionStyle={currentStyle}
        videoRef={videoRef}
      />
    </div>
  );
}
