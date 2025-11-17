export default function ReaderTitle({ title, subtitle }) {
  return (
    <div className="title-container">
      <h4 className="title">{title}</h4>
      {typeof subtitle !== "undefined" && (
        <h4 className="author">{subtitle}</h4>
      )}
    </div>
  );
}
