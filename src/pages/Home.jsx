import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const totalBooks = 3;

  const handleNext = () => setSelectedIndex((prev) => Math.min(prev + 1, totalBooks - 1));
  const handlePrev = () => setSelectedIndex((prev) => Math.max(prev - 1, 0));

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
      subtitle: "Simple Guide to Understanding User Interface Design Guidelines",
      author: "by Jeff Johnson",
      image: "https://m.media-amazon.com/images/I/71i1WQlxYIL._AC_UF1000,1000_QL80_.jpg",
    },
    {
      title: "The Design of Everyday Things",
      subtitle: "Revised and Expanded Edition",
      author: "by Don Norman",
      image: "https://m.media-amazon.com/images/I/71sF8kuMW3L._AC_UF1000,1000_QL80_.jpg",
    },
    {
      title: "Add a New Book",
      subtitle: "Import from PDF",
      author: "",
      image: "https://litkicks.com/wp-content/uploads/2013/05/torocovers1.jpg",
    },
  ];

  return (
    <div className="home">
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
            <section key={index} className={`book-card ${positionClass}`}>
              <img className="book-image" src={book.image} />

              <div className="textbox">
                <h4>{book.title}</h4>
                <h4>{book.subtitle}</h4>
                <p>{book.author}</p>
              </div>

              <div className="button-wrapper">
                <a
                  className="button read-button"
                  onClick={() => navigate(`/reader/${index}`)}
                >
                  Read
                </a>
              </div>
            </section>
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
