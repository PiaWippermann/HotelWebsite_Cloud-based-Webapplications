// File containing methods for routing and loading content into the iframe

/**
 * Function to load content into the iframe and hide the overlay
 * @param {string} url - The URL to load into the iframe
 */
function loadContentIntoIframe(url) {
  const iframe = document.getElementById("mainIframe");
  iframe.src = url;
  document.getElementById("overlay").classList.remove("open");
}

/**
 * Function to load the main page into the iframe
 * This function is called when the page loads
 */
async function loadMain() {
  loadContentIntoIframe("/main");
}

/**
 * Function to load the hotel page into the iframe
 */
async function loadRooms() {
  document.getElementById("overlay").classList.remove("open");
  loadContentIntoIframe(`${window.roomServiceUrl}`);
}

/**
 * Function to load the online shop into the iframe
 */
async function loadEvents() {
  document.getElementById("overlay").classList.remove("open");
  loadContentIntoIframe(`${window.eventServiceUrl}`);
}

/**
 * Function to load the weather page into the iframe
 */
async function loadWeather() {
  document.getElementById("overlay").classList.remove("open");
  console.log("Loading weather service from:", window.weatherServiceUrl);
  loadContentIntoIframe(`${window.weatherServiceUrl}`);
}

// call loadMain when the DOM is fully loaded to initialize the iframe
window.addEventListener("DOMContentLoaded", () => {
  loadMain();
});
