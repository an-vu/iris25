import { useNavigate } from "react-router-dom";
import { useState } from "react";
import IrisToggle from "../components/IrisToggle.jsx";
import ComingSoon from "../components/ComingSoon.jsx";

export default function NavbarReader() {
  const navigate = useNavigate();
  const [showComingSoon, setShowComingSoon] = useState(false);
  const handleComingSoon = () => setShowComingSoon(true);

  return (
    <>
      <div className="big-gap navbar-button-container">
        {/* Home + Iris group */}
        <div className="group navbar-button-container">
          {/* Home Button */}
          <button
            className="nav-button svg-button"
            onClick={() => navigate("/")}
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
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

          {/* Iris Toggle */}
          <IrisToggle />
        </div>

        {/* Main dark group */}
        <div className="dark group navbar-button-container">
          {/* Previous */}
          <button className="nav-button svg-button" onClick={handleComingSoon}>
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 19V5M16.4005 6.07961L10.5617 10.7506C10.0279 11.1777 9.76097 11.3912 9.66433 11.6492C9.5796 11.8754 9.5796 12.1246 9.66433 12.3508C9.76097 12.6088 10.0279 12.8223 10.5617 13.2494L16.4005 17.9204C17.2327 18.5861 17.6487 18.919 17.9989 18.9194C18.3035 18.9197 18.5916 18.7812 18.7815 18.5432C19 18.2695 19 17.7367 19 16.671V7.329C19 6.2633 19 5.73045 18.7815 5.45677C18.5916 5.21876 18.3035 5.0803 17.9989 5.08063C17.6487 5.081 17.2327 5.41387 16.4005 6.07961Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="svg-label">Previous</span>
          </button>

          {/* Next */}
          <button className="nav-button svg-button" onClick={handleComingSoon}>
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 5V19M7.59951 17.9204L13.4383 13.2494C13.9721 12.8223 14.239 12.6088 14.3357 12.3508C14.4204 12.1246 14.4204 11.8754 14.3357 11.6492C14.239 11.3912 13.9721 11.1777 13.4383 10.7506L7.59951 6.07961C6.76734 5.41387 6.35125 5.081 6.00108 5.08063C5.69654 5.0803 5.40845 5.21876 5.21846 5.45677C5 5.73045 5 6.2633 5 7.329V16.671C5 17.7367 5 18.2695 5.21846 18.5432C5.40845 18.7812 5.69654 18.9197 6.00108 18.9194C6.35125 18.919 6.76734 18.5861 7.59951 17.9204Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="svg-label">Next</span>
          </button>
        </div>

        {/* Zoom group */}
        <div className="dark group navbar-button-container">
          {/* Zoom In */}
          <button className="nav-button svg-button" onClick={handleComingSoon}>
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 21L16.65 16.65M11 8V14M8 11H14M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="svg-label">Zoom In</span>
          </button>

          {/* Zoom Out */}
          <button className="nav-button svg-button" onClick={handleComingSoon}>
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 21L16.65 16.65M8 11H14M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="svg-label">Zoom Out</span>
          </button>
        </div>

        {/* Search + Settings group */}
        <div className="group navbar-button-container">
          {/* Search */}
          <button className="nav-button svg-button" onClick={handleComingSoon}>
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="svg-label">Search</span>
          </button>

          {/* Settings */}
          <button className="nav-button svg-button" onClick={handleComingSoon}>
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 15C13.657 15 15 13.657 15 12C15 10.343 13.657 9 12 9C10.343 9 9 10.343 9 12C9 13.657 10.343 15 12 15Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M18.7273 14.7273C18.6063 15.0015 18.5702 15.3056 18.6236 15.6005C18.6771 15.8954 18.8177 16.1676 19.0273 16.3818L19.0818 16.4364C19.2509 16.6052 19.385 16.8057 19.4765 17.0265C19.568 17.2472 19.6151 17.4838 19.6151 17.7227..."
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="svg-label">Settings</span>
          </button>
        </div>
      </div>

      {/* Coming Soon Modal */}
      <ComingSoon
        show={showComingSoon}
        onClose={() => setShowComingSoon(false)}
        message="This feature is under development"
      />
    </>
  );
}