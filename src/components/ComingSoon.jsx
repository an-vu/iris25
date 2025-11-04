import React, { useEffect } from "react";
import "../styles/ComingSoon.css";

export default function ComingSoon({ show, onClose, message }) {
  // Close with ESC key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (show) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className={`overlay ${show ? "show" : ""}`} onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h4>Coming Soon</h4>
        <p>{message || "This feature is under development"}</p>
        <button onClick={onClose}>Go Back</button>
      </div>
    </div>
  );
}