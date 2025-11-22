import BookCard from "./cards/BookCard.jsx";

export default function BookStack({ books, selectedIndex }) {
  return (
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
  );
}
