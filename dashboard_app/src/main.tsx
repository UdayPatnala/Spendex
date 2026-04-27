import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import MobileVersion from "./MobileVersion";
import "./styles.css";

const path = window.location.pathname.toLowerCase();
const shouldRenderMobileVersion = path === "/mobile" || path === "/mobile/";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {shouldRenderMobileVersion ? <MobileVersion /> : <App />}
  </React.StrictMode>,
);
