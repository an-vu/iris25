import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { IrisManager } from "./iris/contexts/IrisManager.jsx";
import "./index.css";
import "./styles";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter basename="/iris25/">
    <IrisManager>
      <App />
    </IrisManager>
  </BrowserRouter>
);
