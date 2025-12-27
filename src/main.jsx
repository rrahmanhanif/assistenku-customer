import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { initializeRuntimeLogging } from "./app/runtimeLogger";

import "leaflet/dist/leaflet.css";

const cleanupLogging = initializeRuntimeLogging();

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    cleanupLogging();
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
