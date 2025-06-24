import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles.css";

// Haunt isolation system initialized

// Temporarily disable service worker to fix upload issues
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/service-worker.js')
//       .then((registration) => {
//         // Service worker registered successfully
//       })
//       .catch((registrationError) => {
//         // Service worker registration failed
//       });
//   });
// }

createRoot(document.getElementById("root")!).render(<App />);
