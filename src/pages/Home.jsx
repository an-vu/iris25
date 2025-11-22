import { useState, useEffect, useRef } from "react";
import { books } from "../data/books.js";
import { BookCard, NavbarHome } from "../components";
import { useIrisContext } from "../iris/IrisManager.jsx";
import { useHomeGazeZones } from "../iris/hooks/useHomeGazeZones.js";

export default function Home() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const totalBooks = books.length;
  const [centerZoneStyle, setCenterZoneStyle] = useState(null);
  const [centerRect, setCenterRect] = useState(null);
  const centerZoneRef = useRef(null);
  const lastActionZoneRef = useRef(null);
  const lastCenterTriggerRef = useRef(0);
  const centerTriggerTimerRef = useRef(null);
  const scrollRepeatTimeoutRef = useRef(null);
  const scrollRepeatIntervalRef = useRef(null);
  const centerDwellMs = 750;
  const centerCooldownMs = 1200;
  const scrollRepeatDelayMs = 1000; // wait before repeating
  const scrollRepeatIntervalMs = 700; // repeat cadence
  const centerRepeatDelayMs = 1200;
  const { irisEnabled, hasCalibrated } = useIrisContext();

  const handleNext = () =>
    setSelectedIndex((prev) => Math.min(prev + 1, totalBooks - 1));
  const handlePrev = () =>
    setSelectedIndex((prev) => Math.max(prev - 1, 0));

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  // Smooth background transition
  const [bgClass, setBgClass] = useState("bg-book-1");

  useEffect(() => {
    const newClass = `bg-book-${selectedIndex + 1}`;
    const timer = setTimeout(() => setBgClass(newClass), 250); // smoother transition
    return () => clearTimeout(timer);
  }, [selectedIndex]);

  useEffect(() => {
    let rafId = null;

    const updateCenterZone = () => {
      const button = document.querySelector(".book-card.centered .read-button");
      const container = document.querySelector(".home");
      if (!button || !container) {
        setCenterZoneStyle(null);
        setCenterRect(null);
        return;
      }

      const buttonRect = button.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const paddedWidth = buttonRect.width * 1.5;
      const paddedHeight = buttonRect.height * 1.5;
      const padX = (paddedWidth - buttonRect.width) / 2;
      const padY = (paddedHeight - buttonRect.height) / 2;

      const left = buttonRect.left - containerRect.left - padX;
      const top = buttonRect.top - containerRect.top - padY;

      setCenterZoneStyle({
        left: `${left}px`,
        top: `${top}px`,
        width: `${paddedWidth}px`,
        height: `${paddedHeight}px`,
      });
    };

    const handleResize = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateCenterZone);
    };

    updateCenterZone();
    window.addEventListener("resize", handleResize);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!centerZoneStyle || !centerZoneRef.current) {
      setCenterRect(null);
      return undefined;
    }

    const updateRect = () => {
      if (!centerZoneRef.current) return;
      const rect = centerZoneRef.current.getBoundingClientRect();
      setCenterRect({
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
      });
    };

    updateRect();
    window.addEventListener("resize", updateRect);
    return () => window.removeEventListener("resize", updateRect);
  }, [centerZoneStyle]);

  const { zone, isLeft, isCenter, isRight } = useHomeGazeZones({
    enabled: irisEnabled && hasCalibrated,
    centerRect,
    leftRatio: 0.25,
    rightRatio: 0.75,
    dwellMs: 450,
  });

  useEffect(() => {
    if (centerTriggerTimerRef.current) {
      clearTimeout(centerTriggerTimerRef.current);
      centerTriggerTimerRef.current = null;
    }
    if (scrollRepeatTimeoutRef.current) {
      clearTimeout(scrollRepeatTimeoutRef.current);
      scrollRepeatTimeoutRef.current = null;
    }
    if (scrollRepeatIntervalRef.current) {
      clearInterval(scrollRepeatIntervalRef.current);
      scrollRepeatIntervalRef.current = null;
    }
    if (!zone) {
      lastActionZoneRef.current = null;
      return;
    }
    if (zone === lastActionZoneRef.current) return;
    lastActionZoneRef.current = zone;

    const startScrollRepeat = (fn) => {
      scrollRepeatTimeoutRef.current = setTimeout(() => {
        scrollRepeatIntervalRef.current = setInterval(fn, scrollRepeatIntervalMs);
      }, scrollRepeatDelayMs);
    };

    if (zone === "left") {
      handlePrev();
      startScrollRepeat(handlePrev);
    }
    if (zone === "right") {
      handleNext();
      startScrollRepeat(handleNext);
    }
    if (zone === "center" && centerRect) {
      centerTriggerTimerRef.current = setTimeout(() => {
        const now = Date.now();
        if (now - lastCenterTriggerRef.current < centerCooldownMs) return;
        lastCenterTriggerRef.current = now;
        const btn = document.querySelector(".book-card.centered .read-button");
        if (btn) btn.click();
      }, centerDwellMs + centerRepeatDelayMs);
    }
  }, [zone]);

  return (
    <div className={`home background ${bgClass}`}>
        <div className="gaze-zone-overlay">
          <div className={`zone left-zone${isLeft ? " active" : ""}`} />
        <div
          ref={centerZoneRef}
          className={`zone center-zone${isCenter ? " active" : ""}`}
          style={
            centerZoneStyle
              ? {
                ...centerZoneStyle,
                position: "absolute",
                flex: "0 0 auto",
                transform: "none",
                }
              : undefined
          }
        />
        <div className={`zone right-zone${isRight ? " active" : ""}`} />
      </div>
      <div className="master-container">
        {/* Scroll Arrows */}
        <button className={`nav-button svg-button scroll-button left${isLeft ? " gaze-active" : ""}`} onClick={handlePrev}>
          <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <button className={`nav-button svg-button scroll-button right${isRight ? " gaze-active" : ""}`} onClick={handleNext}>
          <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Book Stack */}
        <div className="book-stack">
          {books.map((book, index) => {
            let positionClass = "hidden";
            if (index === selectedIndex) positionClass = "centered";
            else if (index === selectedIndex - 1) positionClass = "left";
            else if (index === selectedIndex + 1) positionClass = "right";

            return (
              <BookCard
                key={index}
                book={book}
                index={index}
                positionClass={positionClass}
              />
            );
          })}
        </div>

        {/* Bottom Navbar */}
        <NavbarHome />
      </div>
    </div>
  );

}
