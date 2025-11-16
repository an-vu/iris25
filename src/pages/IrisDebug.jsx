import { useNavigate } from "react-router-dom";
import IrisToggle from "../components/buttons/IrisToggle.jsx";

export default function IrisDebug() {
  const navigate = useNavigate();

  return (
    <div className="reader background">
      <div className="master-container">
        <div className="title-container">
          <h4 className="title">Iris Debug</h4>
          <h4 className="author">WebGazer sandbox</h4>
        </div>

        <div className="reader-container">
          <div className="reader-view"></div>
          <div className="gaze-controls">
            <button className="gaze-button up"></button>
            <button className="gaze-button down"></button>
          </div>
        </div>

        <div className="big-gap navbar-button-container">
          <div className="group navbar-button-container">
            <button className="nav-button svg-button" onClick={() => navigate("/")}>
              <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 21V13.6C9 13.04 9 12.76 9.11 12.546C9.205 12.358 9.358 12.205 9.546 12.109C9.76 12 10.04 12 10.6 12H13.4C13.96 12 14.24 12 14.454 12.109C14.642 12.205 14.795 12.358 14.891 12.546C15 12.76 15 13.04 15 13.6V21M2 9.5L11.04 2.72C11.384 2.462 11.556 2.333 11.745 2.283C11.912 2.239 12.088 2.239 12.255 2.283C12.444 2.333 12.616 2.462 12.96 2.72L22 9.5M4 8V17.8C4 18.92 4 19.48 4.218 19.908C4.41 20.284 4.716 20.59 5.092 20.782C5.52 21 6.08 21 7.2 21H16.8C17.92 21 18.48 21 18.908 20.782C19.284 20.59 19.59 20.284 19.782 19.908C20 19.48 20 18.92 20 17.8V8L13.92 3.44C13.231 2.924 12.887 2.665 12.509 2.566C12.175 2.478 11.825 2.478 11.491 2.566C11.113 2.665 10.769 2.924 10.08 3.44L4 8Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="svg-label">Home</span>
            </button>

            <IrisToggle />
          </div>
        </div>
      </div>
    </div>
  );
}
