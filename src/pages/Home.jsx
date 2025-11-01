import { useState, useEffect } from "react";
import "../styles/Home.css";
import "../styles/BookCard.css";
import "../styles/Navbar.css";
import "../styles/Button.css";

import BookCard from "../components/BookCard.jsx";
import Navbar from "../components/NavbarHome.jsx";

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

  const books = [
    {
      title: "Designing with the Mind in Mind",
      subtitle:
        "Simple Guide to Understanding User Interface Design Guidelines",
      author: "by Jeff Johnson",
      image:
        "https://m.media-amazon.com/images/I/71i1WQlxYIL._AC_UF1000,1000_QL80_.jpg",
    },
    {
      title: "The Design of Everyday Things",
      subtitle: "Revised and Expanded Edition",
      author: "by Don Norman",
      image:
        "https://m.media-amazon.com/images/I/71sF8kuMW3L._AC_UF1000,1000_QL80_.jpg",
    },
    {
      title: "Add a New Book",
      subtitle: "Import from PDF",
      author: "",
      image:
        "https://litkicks.com/wp-content/uploads/2013/05/torocovers1.jpg",
    },
  ];

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
        <button className="scroll-btn left" onClick={handlePrev}>←</button>
        <button className="scroll-btn right" onClick={handleNext}>→</button>

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
        <Navbar />
      </div>
    </div>
  );

}
