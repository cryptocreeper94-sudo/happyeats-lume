import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

setTimeout(() => {
  const splash = document.getElementById("pwa-splash");
  if (splash) {
    splash.classList.add("hide");
    setTimeout(() => splash.remove(), 600);
  }
}, 2800);
