import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const totalBooks = 5;

  const handleNext = () => {
    setSelectedIndex((prev) => Math.min(prev + 1, totalBooks - 1));
  };

  const handlePrev = () => {
    setSelectedIndex((prev) => Math.max(prev - 1, 0));
  };

  // keyboard arrow navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className="home">
      {/* Navigation arrows */}
      <button className="scroll-btn left" onClick={handlePrev}>
        ←
      </button>
      <button className="scroll-btn right" onClick={handleNext}>
        →
      </button>

      {/* Book Stack */}
      <div className="book-stack">
        {[1, 2, 3, 4, 5].map((id, index) => {
          let positionClass = "hidden";
          if (index === selectedIndex) positionClass = "centered";
          else if (index === selectedIndex - 1) positionClass = "left";
          else if (index === selectedIndex + 1) positionClass = "right";

          return (
            <div key={id} className={`book-card ${positionClass}`}>
              <h2>Book {id}</h2>
              <p>Author Name</p>
              <button onClick={() => navigate(`/reader/${id}`)}>Read</button>
            </div>
          );
        })}
      </div>

      {/* Bottom Dock */}
      <div className="dock">
        <button>Info</button>
        <button>Eye Toggle</button>
        <button>Add / Import</button>
        <button>Settings</button>
      </div>
    </div>
  );
}
