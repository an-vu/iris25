import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Reader from "./pages/Reader";
import IrisDebug from "./pages/IrisDebug";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <>
      <canvas
        id="plotting_canvas"
        width="0"
        height="0"
        style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0 }}
        aria-hidden="true"
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reader/:bookId" element={<Reader />} />
        <Route path="/iris-debug" element={<IrisDebug />} />
        <Route path="*" element={<NotFound />} /> {/* Catch-all 404 route */}
      </Routes>
    </>
  );
}
