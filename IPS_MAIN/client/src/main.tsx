import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { Toaster } from "react-hot-toast";
import {  BrowserRouter as Router } from "react-router-dom";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Router>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2000,
        }}
        reverseOrder={false}
      />
    </Router>
  </React.StrictMode>
);
