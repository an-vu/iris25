import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
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
  const files = currentBook.files || ["/iris25/books/test.pdf"];
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < files.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  useEffect(() => {
    console.log(`Loaded Reader for book ID: ${bookId}, chapter ${currentIndex + 1}`);
  }, [bookId, currentIndex]);

  return (
    <div className="reader background">
      <div className="master-container">

        {/* Title Section */}
        <div className="title-container">
          <h4 className="title">{currentBook.title}</h4>
          <h4 className="author">{currentBook.author}</h4>
        </div>

        {/* Reader Area */}
        <ReaderContainer filePath={files[currentIndex]} />

        {/* Bottom Navbar */}
        <NavbarReader
          onNext={handleNext}
          onPrevious={handlePrevious}
          disableNext={currentIndex === files.length - 1}
          disablePrevious={currentIndex === 0}
        />
      </div>
    </div>
  );
}