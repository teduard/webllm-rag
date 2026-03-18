import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { About } from "./components/About";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
    {/* <About /> */}
  </React.StrictMode>,
);
