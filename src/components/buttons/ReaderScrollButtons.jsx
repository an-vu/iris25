import NavArrow from "./NavArrow.jsx";

export default function ReaderScrollButtons({
  onScrollUp,
  onScrollDown,
  isTopActive,
  isBottomActive,
}) {
  return (
    <div className="reader-scroll-buttons">
      <NavArrow direction="up" active={isTopActive} onClick={onScrollUp} />
      <NavArrow direction="down" active={isBottomActive} onClick={onScrollDown} />
    </div>
  );
}
