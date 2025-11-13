import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Reader from "./pages/Reader";
import CalibrationLab from "./pages/CalibrationLab";
import EyeTrackingDebug from "./pages/EyeTrackingDebug";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/reader/:bookId" element={<Reader />} />
      <Route path="/calibration-lab" element={<CalibrationLab />} />
      <Route path="/eye-debug" element={<EyeTrackingDebug />} />
      <Route path="*" element={<NotFound />} /> {/* Catch-all 404 route */}
    </Routes>
  );
}
