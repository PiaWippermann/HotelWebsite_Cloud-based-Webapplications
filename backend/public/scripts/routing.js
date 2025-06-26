// File containing methods for routing and loading content into the iframe

/**
 * Function to load content into the iframe and hide the overlay
 * @param {string} url - The URL to load into the iframe
 */
function loadContentIntoIframe(url) {
  hideConfigurationModels();
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
async function loadRoute() {
  loadContentIntoIframe("/route");
}

/**
 * Function to load the online shop into the iframe
 */
async function loadOnlineShop() {
  loadContentIntoIframe("/online-shop");
}

/**
 * Function to load the contact page into the iframe
 */
async function showConfigurationModels() {
  if (document.getElementById("sub-nav-list").classList.contains("active")) {
    // If sub-nav is already active, just hide it
    hideConfigurationModels();
    return;
  }
  const mainNavList = document.getElementById("main-nav-list");
  const subNavList = document.getElementById("sub-nav-list");
  const carModelsContainer = document.getElementById("sub-nav-list"); // Use subNavList to append models

  // Clear previous models by removing all children of the carModelsContainer
  while (carModelsContainer.children.length > 0) {
    carModelsContainer.removeChild(carModelsContainer.firstChild);
  }

  try {
    // Fetch models from your backend's /configuration endpoint (which now returns JSON)
    const response = await fetch("/configuration");
    const data = await response.json();
    console.log("Geladene Modelle:", data);

    if (data.models && data.models.length > 0) {
      data.models.forEach((model) => {
        const listItem = document.createElement("li");
        listItem.classList.add("model-item");

        const anchor = document.createElement("a");
        anchor.href = `javascript:loadContentIntoIframe('${model.url}')`;

        const img = document.createElement("img");
        img.src = model.image;
        img.alt = model.name;

        const name = document.createElement("span");
        name.classList.add("model-name");
        name.textContent = model.name;

        anchor.appendChild(name);
        anchor.appendChild(img);
        listItem.appendChild(anchor);
        carModelsContainer.appendChild(listItem);
      });
    } else {
      const listItem = document.createElement("li");
      listItem.classList.add("model-item");
      listItem.textContent = "Keine Modelle verfügbar.";
      carModelsContainer.appendChild(listItem);
    }

    subNavList.classList.add("active"); // Show sub nav
  } catch (error) {
    console.error("Fehler beim Laden der Automodelle:", error);
    const listItem = document.createElement("li");
    listItem.classList.add("model-item");
    listItem.textContent = "Fehler beim Laden der Modelle.";
    carModelsContainer.appendChild(listItem);
    mainNavList.style.display = "none";
    subNavList.classList.add("active");
  }
}

/**
 * Function to hide the configuration models sub-navigation
 */
function hideConfigurationModels() {
  document.getElementById("sub-nav-list").classList.remove("active"); // Hide sub nav
}

// call loadMain when the DOM is fully loaded to initialize the iframe
window.addEventListener("DOMContentLoaded", () => {
  loadMain();
});
