import { useCallback, useEffect, useState } from "react";

export function useChapterNavigation(files) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [files]);

  const handleNext = useCallback(() => {
    setCurrentIndex((index) => {
      if (index >= files.length - 1) return index;
      return index + 1;
    });
  }, [files.length]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((index) => {
      if (index <= 0) return index;
      return index - 1;
    });
  }, []);

  const disableNext = currentIndex >= files.length - 1;
  const disablePrevious = currentIndex === 0;
  const currentFile = files[currentIndex] ?? files[0];

  return {
    currentIndex,
    currentFile,
    handleNext,
    handlePrevious,
    disableNext,
    disablePrevious,
  };
}
