import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Clear cache and force reload if needed
const CACHE_VERSION = Date.now();
const STORED_VERSION = localStorage.getItem('cache_version');

if (STORED_VERSION !== CACHE_VERSION.toString()) {
  // Clear all caches
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
      });
    });
  }
  
  // Clear localStorage
  localStorage.setItem('cache_version', CACHE_VERSION.toString());
  
  // Force reload if this is not the first load
  if (STORED_VERSION !== null) {
    window.location.reload();
  }
}

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`/service-worker.js?v=${CACHE_VERSION}`)
      .then((registration) => {
        // Service worker registered successfully
      })
      .catch((registrationError) => {
        // Service worker registration failed
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
