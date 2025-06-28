// launcher.js
function showError(message, subtitle) {
  const spinner = document.getElementById('spinner');
  const messageEl = document.getElementById('message');
  const subtitleEl = document.getElementById('subtitle');
  
  spinner.style.display = 'none';
  messageEl.textContent = message;
  messageEl.classList.add('error');
  subtitleEl.textContent = subtitle;
}

function showLoading(message, subtitle) {
  const messageEl = document.getElementById('message');
  const subtitleEl = document.getElementById('subtitle');
  
  messageEl.textContent = message;
  subtitleEl.textContent = subtitle;
}

// Parse URL parameters to get haunt ID
const urlParams = new URLSearchParams(window.location.search);
const hauntParam = urlParams.get('haunt');

// Also check URL path for backward compatibility
const pathParts = window.location.pathname.split('/');
const urlHauntId = pathParts[2]; // /launcher/[hauntId]

// Get stored haunt preference
const lastHauntId = localStorage.getItem("lastHauntId");

// Determine which haunt to launch
let targetHaunt = null;

if (hauntParam) {
  // Primary: Use query parameter ?haunt=...
  targetHaunt = hauntParam;
  localStorage.setItem("lastHauntId", hauntParam);
  showLoading("Launching your game...", `Loading ${hauntParam} trivia experience`);
} else if (urlHauntId) {
  // Fallback: Use URL path for backward compatibility
  targetHaunt = urlHauntId;
  localStorage.setItem("lastHauntId", urlHauntId);
  showLoading("Launching your game...", `Loading ${urlHauntId} trivia experience`);
} else if (lastHauntId) {
  // Last resort: Use stored preference
  targetHaunt = lastHauntId;
  showLoading("Launching your game...", `Returning to ${lastHauntId} trivia`);
}

// Add small delay for better UX, then redirect
setTimeout(() => {
  if (targetHaunt) {
    window.location.href = `/?haunt=${targetHaunt}`;
  } else {
    showError(
      "Missing Haunt ID. Please scan your code or use the correct launch link.",
      "Make sure your launch link includes ?haunt=your-haunt-id parameter."
    );
  }
}, 800); // Brief delay to show loading state