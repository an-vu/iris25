import { useEffect } from "react";

import "../styles/Reader.css";
import "../styles/MasterContainer.css";
import "../styles/Navbar.css";
import "../styles/ButtonNavbar.css";
import "../styles/ReaderTitle.css";
import "../styles/ReaderContainer.css";

import ReaderContainer from "../components/ReaderContainer.jsx";
import NavbarReader from "../components/NavbarReader.jsx";

export default function NotFound() {
  useEffect(() => {
    console.log("404 Page Loaded");
  }, []);

  return (
    <div className="reader background">
      <div className="master-container">
        {/* Title Section */}
        <div className="title-container">
          <h4 className="title">404 💔 You Got Lost?</h4>
          <h4 className="author">Get Shreked.</h4>
        </div>

        {/* Reader Area — reuse ReaderContainer but pass test.pdf */}
        <ReaderContainer files={["/iris25/books/test.pdf"]} />

        {/* Bottom Navbar */}
        <NavbarReader onlyHome />
      </div>
    </div>
  );
}