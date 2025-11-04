import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { books } from "../data/books.js";

import "../styles/Reader.css";
import "../styles/MasterContainer.css";
import "../styles/Navbar.css";
import "../styles/ButtonNavbar.css";
import "../styles/ReaderTitle.css";
import "../styles/ReaderContainer.css";

import NavbarReader from "../components/NavbarReader.jsx";
import ReaderContainer from "../components/ReaderContainer.jsx";

export default function Reader() {
  const { bookId } = useParams();
  const currentBook = books[bookId] || {};

  useEffect(() => {
    console.log(`Loaded Reader for book ID: ${bookId}`);
  }, [bookId]);

  return (
    <div className="reader background">
      <div className="master-container">

        {/* Title Section */}
        <div className="title-container">
          <h4 className="title">{currentBook.title}</h4>
          <h4 className="author">{currentBook.author}</h4>
        </div>

        {/* Reader Area */}
        <ReaderContainer />

        {/* Bottom Navbar */}
        <NavbarReader />
      </div>
    </div>
  );
}