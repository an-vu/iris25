import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import "../styles/Home.css";
import "../styles/BookCard.css";
import "../styles/Navbar.css";
import "../styles/Button.css";
import "../styles/ButtonNavbar.css";

import NavbarReader from "../components/NavbarReader.jsx";

export default function Reader() {
  const { bookId } = useParams();
  const navigate = useNavigate();

  // Optional state placeholder for future features (page tracking, etc.)
  const [page, setPage] = useState(1);

  useEffect(() => {
    // Example placeholder effect for future reader logic
    console.log(`Loaded Reader for book ID: ${bookId}`);
  }, [bookId]);

  return (
    <div className="reader-container">
      <div className="reader-content">
        <h1>Reader Page</h1>
        <p>Currently reading book ID: {bookId}</p>
      </div>

      {/* Bottom Navbar */}
      <NavbarReader />
    </div>
  );
}
