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

// Temporarily disable service worker to force cache clear
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
