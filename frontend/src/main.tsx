import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import "./app.css";
createRoot(document.getElementById("root")!).render(
  <div style={{ width: "1200px", height: "1200px" }}>
    <App />
  </div>
);
