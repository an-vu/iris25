import { useNavigate } from "react-router-dom";
import "../styles/BookCard.css";

export default function BookCard({ book, positionClass, index }) {
  const navigate = useNavigate();

  return (
    <section className={`book-card ${positionClass}`}>
      <img className="book-image" src={book.image} alt={book.title} />

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
}
