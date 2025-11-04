import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/BookCard.css";
import ComingSoon from "../components/ComingSoon.jsx";

export default function BookCard({ book, positionClass, index }) {
  const navigate = useNavigate();
  const [showComingSoon, setShowComingSoon] = useState(false);

  const handleRead = () => {
    const hasFiles = book.files && book.files.length > 0;

    if (!hasFiles) {
      setShowComingSoon(true);
      return;
    }

    navigate(`/reader/${index}`, { state: { files: book.files } });
  };

  return (
    <>
      <section className={`book-card ${positionClass}`}>
        <img className="book-image" src={book.image} alt={book.title} />

        <div className="textbox">
          <h4>{book.title}</h4>
          <h4>{book.subtitle}</h4>
          <p>{book.author}</p>
        </div>

        <div className="button-wrapper">
          <a className="read-button" onClick={handleRead}>
            {book.title === "Add a New Book" ? "Add" : "Read"}
          </a>
        </div>
      </section>

      {/* Render the modal at the top level using a portal */}
      {showComingSoon &&
        createPortal(
          <ComingSoon show={showComingSoon} onClose={() => setShowComingSoon(false)} />,
          document.body
        )}
    </>
  );
}