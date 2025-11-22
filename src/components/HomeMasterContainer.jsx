import NavArrow from "./buttons/NavArrow.jsx";
import BookStack from "./BookStack.jsx";
import NavbarHome from "./navbar/NavbarHome.jsx";

export default function HomeMasterContainer({
  isLeft,
  isRight,
  selectedIndex,
  onPrev,
  onNext,
  books
}) {
  return (
    <div className="master-container">

      <NavArrow
        direction="left"
        active={isLeft}
        onClick={onPrev}
      />

      <NavArrow
        direction="right"
        active={isRight}
        onClick={onNext}
      />

      <BookStack books={books} selectedIndex={selectedIndex} />

      <NavbarHome />
    </div>
  );
}
