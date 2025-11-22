import { useState, useEffect } from "react";

export function useHomeBackground(selectedIndex) {
  const [bgClass, setBgClass] = useState("bg-book-1");

  useEffect(() => {
    const newClass = `bg-book-${selectedIndex + 1}`;

    const timer = setTimeout(() => {
      setBgClass(newClass);
    }, 250); // smooth fade

    return () => clearTimeout(timer);
  }, [selectedIndex]);

  return bgClass;
}
