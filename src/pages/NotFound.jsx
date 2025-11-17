import { ReaderContainer, NavbarReader } from "../components";

export default function NotFound() {
  return (
    <div className="reader background">
      <div className="master-container">
        {/* Title Section */}
        <div className="title-container">
          <h4 className="title">404 💔 You Got Lost?</h4>
          <h4 className="author">Shrek, Take the Wheel</h4>
        </div>

        {/* Reader Area — reuse ReaderContainer but pass test.pdf */}
        <ReaderContainer filePath="/iris25/books/test.pdf" />

        {/* Bottom Navbar */}
        <NavbarReader onlyHome />
      </div>
    </div>
  );
}
