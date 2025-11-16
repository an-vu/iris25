import CameraButton from "../buttons/CameraButton.jsx";

export default function CalibrationStep1a({ complete, onAllow }) {
  return (
    <div className="calibration-step">
      <div className="calibration-step__indicator">
        <CameraButton disabled={complete} complete={complete} onClick={onAllow}>
        </CameraButton>
      </div>
      <div className="calibration-step__content">
        <p className="calibration-step__title">Allow camera access</p>
        <p className="calibration-step__desc">
          Iris needs your camera to start calibration.
        </p>
      </div>
    </div>
  );
}
