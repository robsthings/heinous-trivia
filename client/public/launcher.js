// launcher.js
const lastHauntId = localStorage.getItem("lastHauntId");

if (lastHauntId) {
  window.location.href = `/?haunt=${lastHauntId}`;
} else {
  window.location.href = "/";
}