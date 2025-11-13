import { useState, useEffect } from "react";
import { books } from "../data/books.js";
import { BookCard, NavbarHome } from "../components";

export default function Home() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const totalBooks = 3;

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

  return (
    <div className={`home background ${bgClass}`}>
      <div className="master-container">
        {/* Scroll Arrows */}
        <button className="nav-button svg-button scroll-button left" onClick={handlePrev}>
          <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <button className="nav-button svg-button scroll-button right" onClick={handleNext}>
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
