import { useState } from "react";
import { createPortal } from "react-dom";
import CountdownButton from "../buttons/CountdownButton.jsx";

export const CALIBRATION_SECONDS = 5;

export default function CalibrationStep3({ onComplete }) {
  const [showCard, setShowCard] = useState(true);   // show instructions first
  const [active, setActive] = useState(false);      // countdown button state
  const [done, setDone] = useState(false);

  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      {/* INSTRUCTION CARD (visible first) */}
      {showCard && (
        <div className="calibration-overlay instructions">
          <div className="calibration-card__card">
            <p className="calibration-card__eyebrow">
              Iris eye tracking · Accuracy Check
            </p>
            <h2 className="calibration-card__title">
              Hold steady on the center dot
            </h2>

            <ul className="calibration-card__list">
              <li>After clicking Continue, lift your hands off the mouse/trackpad.</li>
              <li>Stare directly at the center dot for five seconds.</li>
              <li>We’ll automatically continue once the countdown finishes.</li>
            </ul>

            <div className="calibration-actions">
              <button
                type="button"
                className="calibration-btn primary"
                onClick={() => {
                  setShowCard(false);   // hide the card
                  setActive(true);      // start countdown mode
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COUNTDOWN OVERLAY (shows after Continue click) */}
      {!showCard && (
        <div className="calibration-overlay calibration-overlay--blocking">
          <div className="calibration-overlay__center">
            <CountdownButton
              auto                           // internal countdown logic
              seconds={CALIBRATION_SECONDS}
              disabled={done}
              complete={done}
              active={active}
              onStart={() => {
                setActive(true);
              }}
              onComplete={() => {
                setDone(true);
                onComplete?.();
              }}
            />
          </div>
        </div>
      )}
    </>,
    document.body
  );
}
