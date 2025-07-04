// File containing methods for styling and handling the overlay

// Open the overlay when the burger menu is clicked
document.getElementById("burger").addEventListener("click", () => {
  document.getElementById("overlay").classList.add("open");
});

// Close the overlay when the close button is clicked
document.getElementById("close-btn").addEventListener("click", () => {
  document.getElementById("overlay").classList.remove("open");
});
