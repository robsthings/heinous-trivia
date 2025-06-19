import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Debug URL at app initialization
console.log('main.tsx - App initialization');
console.log('main.tsx - window.location.href:', window.location.href);
console.log('main.tsx - window.location.search:', window.location.search);

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
