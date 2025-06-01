// launcher.js
// Extract haunt ID from URL path if launching from haunt-specific URL
const pathParts = window.location.pathname.split('/');
const urlHauntId = pathParts[2]; // /launcher/[hauntId]

// Get stored haunt preference
const lastHauntId = localStorage.getItem("lastHauntId");

// Determine which haunt to launch
let targetHaunt = null;

if (urlHauntId) {
  // If launched from haunt-specific URL, use that and store it
  targetHaunt = urlHauntId;
  localStorage.setItem("lastHauntId", urlHauntId);
} else if (lastHauntId) {
  // Otherwise use stored preference
  targetHaunt = lastHauntId;
}

// Redirect to game with haunt parameter
if (targetHaunt) {
  window.location.href = `/?haunt=${targetHaunt}`;
} else {
  window.location.href = "/";
}