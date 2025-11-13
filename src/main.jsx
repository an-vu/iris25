import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { CalibrationProvider } from "./contexts/CalibrationContext.jsx";
import "./index.css";
import "./styles";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter basename="/iris25/">
    <CalibrationProvider>
      <App />
    </CalibrationProvider>
  </BrowserRouter>
);
