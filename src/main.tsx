import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppQueryClientProvider from "./components/AppQueryClientProvider";
import { PreferencesProvider } from "./context/PreferencesContext";
import { ToastProvider } from "./context/ToastContext";
import App from "./App";
import ThemeProvider from "./theme/ThemeProvider";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ToastProvider>
      <PreferencesProvider>
        <AppQueryClientProvider>
          <ThemeProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </ThemeProvider>
        </AppQueryClientProvider>
      </PreferencesProvider>
    </ToastProvider>
  </React.StrictMode>
);
