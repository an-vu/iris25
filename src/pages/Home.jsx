import { books } from "../data/books.js";

import HomeGazeZoneOverlay from "../components/HomeGazeZoneOverlay.jsx";
import HomeMasterContainer from "../components/HomeMasterContainer.jsx";

import { useIrisContext } from "../iris/IrisManager.jsx";
import { useHomeGazeZones } from "../iris/hooks/useHomeGazeZones.js";
import { useHomeNavigation } from "../iris/hooks/useHomeNavigation.js";
import { useHomeBackground } from "../iris/hooks/useHomeBackground.js";
import { useCenterReadZone } from "../iris/hooks/useCenterReadZone.js";
import { useHomeGazeActions } from "../iris/hooks/useHomeGazeActions.js";

export default function Home() {

  // Navigation
  const {
    selectedIndex,
    handleNext,
    handlePrev,
    triggerScrollWithRepeat,
    stopScrollRepeat,
  } = useHomeNavigation(books.length);

  // Background
  const bgClass = useHomeBackground(selectedIndex);

  // Center read-button zone
  const {
    centerZoneRef,
    centerZoneStyle,
    centerRect,
  } = useCenterReadZone();

  const { irisEnabled, hasCalibrated } = useIrisContext();

  // Gaze zone detection
  const { zone, isLeft, isCenter, isRight } = useHomeGazeZones({
    enabled: irisEnabled && hasCalibrated,
    centerRect,
    leftRatio: 0.25,
    rightRatio: 0.75,
    dwellMs: 450,
  });

  // Gaze-triggered actions
  useHomeGazeActions({
    zone,
    centerRect,
    handleNext,
    handlePrev,
    triggerScrollWithRepeat,
    stopScrollRepeat,
    centerDwellMs: 750,
    centerCooldownMs: 1200,
    centerRepeatDelayMs: 1200,
  });

  // Render
  return (
    <div className={`home background ${bgClass}`}>

      <HomeGazeZoneOverlay
        isLeft={isLeft}
        isCenter={isCenter}
        isRight={isRight}
        centerZoneRef={centerZoneRef}
        centerZoneStyle={centerZoneStyle}
      />

      <HomeMasterContainer
        isLeft={isLeft}
        isRight={isRight}
        selectedIndex={selectedIndex}
        onPrev={handlePrev}
        onNext={handleNext}
        books={books}
      />

    </div>
  );
}
