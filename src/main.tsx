import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import "./i18n/config"; // Import i18n configuration before rendering
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n/config";
import { registerSW } from "./registerSW";

// Only register service worker once
if (!window.__SW_REGISTERED) {
  // Register service worker
  registerSW();
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <I18nextProvider i18n={i18n}>
    <App />
  </I18nextProvider>
);